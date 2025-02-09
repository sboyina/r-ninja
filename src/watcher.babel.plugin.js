const t = require("@babel/types");
const babel = require("@babel/core");
const jsx = require('@babel/plugin-syntax-jsx').default;

function isWatchableExpression(path, source, exp, key) {
  return exp 
    && key 
    // && (t.isTemplateLiteral(exp)
    && !key.startsWith('on') 
    &&  (t.isExpression(exp)
          && !t.isFunctionExpression(exp)
          && !t.isArrowFunctionExpression(exp)
          && !t.isBooleanLiteral(exp)
          && !t.isStringLiteral(exp)
          && !t.isNullLiteral(exp)
          && !t.isObjectExpression(exp)
          && !t.isNumericLiteral(exp))
    //);
}

function isEventCallback(path, source, exp, key) {
  return exp && key.startsWith('on') 
    && (t.isFunctionExpression(exp) || t.isArrowFunctionExpression(exp));
}

const methodVistor = {
  'ArrowFunctionExpression': {
    exit(path) {
      const container = path.get('body');
      if (!t.isBlockStatement(path.node?.body)) {
        const refreshCall = t.expressionStatement(t.callExpression(t.identifier('RNinja.check'), [])); // Create check() call
        const returnStatement = t.returnStatement(path.node.body); // Create return statement
        const blockStatement = t.blockStatement([refreshCall, returnStatement]); // Block with refresh and return
        path.node.body = blockStatement;
      } else if (container && container.node['body']) {
        container.unshiftContainer('body', babel.template.statement.ast('RNinja.check();'));
      }
    }
  }
};

const JSXVisitor = {
  JSXExpressionContainer(path, state) {
    const source = path.getSource();
    const exp = path?.container?.value?.expression;
    const key = path.parent && path.parent.name && path.parent.name.name;
    if (source && isWatchableExpression(path, source, exp, key)) {
        const tExp = `watch(() => (${source.substring(1, source.length -1)}))`;
        path.replaceWith(t.jsxExpressionContainer(babel.template.expression.ast(tExp)));
    } else if (source && isEventCallback(path, source, exp, key)) {
      path.traverse(methodVistor);
    }
  }
};
const canMemoize = (node) => {
  // const attr = node.openingElement.attributes.find(a => a.name.name === 'memoize');
  // return !(attr && (attr.value == null || attr.value.value === 'false')); 
  return true;
};
const plugin = function() {
    return {
      inherits: jsx,
      visitor: {
        Program(path) {
          const propsTdentifier = t.identifier('RNinja');
          const importDefaultSpecifier = t.importDefaultSpecifier(propsTdentifier);
          const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral('react-ninja'));
          path.unshiftContainer('body', importDeclaration);
        },
        JSXElement: {
          exit(path, state) {
            const { node, parentPath } = path;
            const nodeName = node.openingElement && node.openingElement.name && node.openingElement.name.name;
            if (node.__watch_processed || !nodeName || nodeName.startsWith('RNinja')) {
              return;
            }
            node.__watch_processed = true;
            path.traverse(JSXVisitor);
            if (canMemoize(node)) {
              const replacer = t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier('RNinja.PropsWatcher'), [
                  t.jsxAttribute(t.jsxIdentifier('render'), t.jsxExpressionContainer(t.arrowFunctionExpression([t.identifier('watch')], node)))
                ], true), // selfClosing set to true
                null,
                [],
                true
              );
              replacer.__watch_processed = true;
              path.replaceWith(replacer);
            }
          }
        }
      }
    };
};

module.exports = plugin;