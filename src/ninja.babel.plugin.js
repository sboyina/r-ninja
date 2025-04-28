const t = require("@babel/types");
const babel = require("@babel/core");
const jsx = require('@babel/plugin-syntax-jsx').default;
const generate = require('@babel/generator').default;

function isWatchableExpression(path, source, exp, key) {
  return exp 
    && key 
    && !/^(\{(\s|\n|\r)*<[A-Za-z])/.test(source)
    // && (t.isTemplateLiteral(exp)
    && !key.startsWith('on') 
    &&  (t.isExpression(exp)
          && !t.isJSXElement(exp)
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
  JSXExpressionContainer: {
    enter(path, state) {
      const source = path.getSource();
      const exp = path?.container?.value?.expression;
      const key = path.parent && path.parent.name && path.parent.name.name;
      if (source && !source.startsWith('{<') && isWatchableExpression(path, source, exp, key)) {
          const tExp = `watch(() => (${source.substring(1, source.length -1)}))`;
          path.replaceWith(t.jsxExpressionContainer(babel.template.expression.ast(tExp)));
      } else if (source && isEventCallback(path, source, exp, key)) {
        path.traverse(methodVistor);
      }
    },
    exit(path, state) {
      const expression = path.node.expression;
      const source = path.getSource();
      const key = path.parent && path.parent.name && path.parent.name.name;
      if (key || !expression || t.isJSXElement(expression) 
          || t.isArrowFunctionExpression(expression) 
          || t.isFunctionExpression(expression)
          || /^\{(\s|\n|\r)*\/\*/.test(source)
          || path.__has_expression_child  
          || (path.parent && path.parent.__has_expression_child)) {
          return;
      }
      if (t.isConditionalExpression(expression)) {
        const props = [];
        props.push(t.jsxAttribute(t.jsxIdentifier('condition'), 
          t.jsxExpressionContainer(babel.template.expression.ast(`watch(() => (${generate(expression.test).code}))`))));
        props.push(t.jsxAttribute(t.jsxIdentifier('onTrue'),
          t.jsxExpressionContainer(t.arrowFunctionExpression([], expression.consequent))));
        props.push(t.jsxAttribute(t.jsxIdentifier('onFalse'), 
          t.jsxExpressionContainer(t.arrowFunctionExpression([], expression.alternate))));
        const replacer = t.jsxElement(
          t.jsxOpeningElement(
            t.jsxMemberExpression(t.jSXIdentifier('RNinja'), t.jsxIdentifier('When')), props, true), // selfClosing set to true
          null,
          [],
          true
        );
        path.replaceWith(replacer);
        wrapPropsWatcher(path);
      } else {
        path.__has_expression_child = true;
        const tSource = generate(expression).code;
        const tExp = `watch(() => (${tSource}))`;
        path.replaceWith(t.jsxExpressionContainer(babel.template.expression.ast(tExp)));
      }
    }
  }
};
const canMemoize = (node) => {
  // const attr = node.openingElement.attributes.find(a => a.name.name === 'memoize');
  // return !(attr && (attr.value == null || attr.value.value === 'false')); 
  return true;
};
const getKey = (node) => {
  const attr = node.openingElement.attributes.find(a => a.name.name === 'key');
  if (attr && t.isStringLiteral(attr.value)) {
    return attr.value.value;
  } else if (attr && t.isJSXExpressionContainer(attr.value) && t.isIdentifier(attr.value.expression)) {
    return attr.value.expression.name;
  }
  return null;
}
const wrapPropsWatcher = (path) => {
  const { node, parentPath } = path;
  const key = getKey(node);
  const props = [];
  if (key) {
    props.push(t.jsxAttribute(t.jsxIdentifier('key'), babel.template.expression.ast(tExp)))
  }
  props.push(t.jsxAttribute(t.jsxIdentifier('render'), t.jsxExpressionContainer(t.arrowFunctionExpression([t.identifier('watch')], node))));
  const replacer = t.jsxElement(
    t.jsxOpeningElement(
      t.jsxMemberExpression(t.jSXIdentifier('RNinja'), t.jsxIdentifier('PropsWatcher')), props, true), // selfClosing set to true
    null,
    [],
    true
  );
  replacer.__watch_processed = !path.__has_expression_child;;
  path.replaceWith(replacer);
}
const plugin = function() {
    return {
      inherits: jsx,
      visitor: {
        Program(path) {
          const propsTdentifier = t.identifier('RNinja');
          const importDefaultSpecifier = t.importDefaultSpecifier(propsTdentifier);
          const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral('r-ninja'));
          path.unshiftContainer('body', importDeclaration);
        },
        JSXElement: {
          exit(path, state) {
            const { node, parentPath } = path;
            const nodeName = node.openingElement && node.openingElement.name && node.openingElement.name.name;
            if (node.__watch_processed || !nodeName) {
              return;
            }
            path.traverse(JSXVisitor);
            node.__watch_processed = !path.__has_expression_child;
            if (canMemoize(node)) {
              wrapPropsWatcher(path);
            }
          }
        }
      }
    };
};

module.exports = plugin;