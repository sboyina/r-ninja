const t = require("@babel/types");
const babel = require("@babel/core");
const jsx = require('@babel/plugin-syntax-jsx').default;

function isWatchableExpression(path) {
  const exp = path?.node?.expression || path?.container?.value?.expression;
  const key = path.parent && path.parent.name && path.parent.name.name;
  return exp 
    // && (!key || !key.startsWith('on'))
    && (t.isTemplateLiteral(exp)
      || (t.isExpression(exp)
          && !t.isCallExpression(exp)
          && !t.isFunctionExpression(exp)
          && !t.isArrowFunctionExpression(exp)
          && !t.isBooleanLiteral(exp)
          && !t.isStringLiteral(exp)
          && !t.isNullLiteral(exp)
          && !t.isObjectExpression(exp)
          && !t.isNumericLiteral(exp))
    );
}

function isEventCallback(path) {
  const exp = path && path.container && path.container.value && path.container.value.expression;
  const name = path && path.container && path.container.name && path.container.name.name;
  return exp && (t.isFunctionExpression(exp) || t.isArrowFunctionExpression(exp));
}

const JSXVisitor = {
  JSXExpressionContainer(path, state) {
    const exp = path.getSource();
    if (exp && isWatchableExpression(path)) {
        const tExp = `watch(() => (${exp.substring(1, exp.length -1)}))`;
        path.replaceWith(t.jsxExpressionContainer(babel.template.expression.ast(tExp)));
    } else if (exp && isEventCallback(path)) {
      path.traverse({
        'ArrowFunctionExpression|FunctionExpression':  function(path, state) {
          const container = path.get('body');
          if (container && container.node['body']) {
            container.pushContainer('body', babel.template.statement.ast('doRefreshUI();'));
          }
        }
      })
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
          const propsTdentifier = t.identifier('PropsWatcher');
          const importDefaultSpecifier = t.importDefaultSpecifier(propsTdentifier);
          const doRefreshIdentifier = t.identifier('doRefreshUI');
          const doRefreshSpecifier = t.importSpecifier(doRefreshIdentifier);
          const importDeclaration = t.importDeclaration([importDefaultSpecifier, doRefreshSpecifier], t.stringLiteral('@/watcher'));
          path.unshiftContainer('body', importDeclaration);
        },
        JSXElement: {
          exit(path, state) {
            const { node, parentPath } = path;
            const nodeName = node.openingElement && node.openingElement.name && node.openingElement.name.name;
            if (node.__watch_processed || !nodeName) {
              return;
            }
            node.__watch_processed = true;
            path.traverse(JSXVisitor);
            if (canMemoize(node)) {
              const replacer = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('PropsWatcher'), [
                t.jsxAttribute(t.jsxIdentifier('render'), t.jsxExpressionContainer(t.arrowFunctionExpression([t.identifier('watch')], node)))
              ]), null, [], true);
              replacer.__watch_processed = true;
              path.replaceWith(replacer);
            }
          }
        }
      }
    };
};

module.exports = plugin;