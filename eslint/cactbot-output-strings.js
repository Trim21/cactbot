const t = require('@babel/types');
const textProps = ['alarmText', 'alertText', 'infoText', 'tts'];


/**
 * @type {import("eslint").Rule.RuleModule}
 */
const ruleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'suggest outputStrings in cactbot',
      category: 'Stylistic Issues',
      recommended: true,
      url: 'https://github.com/quisquous/cactbot/blob/main/docs/RaidbossGuide.md#trigger-elements',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noOutputStrings: 'no outputStrings in trigger',
      notFoundProperty: 'no \'{{prop}}\' in \'{{outputParam}}\'',
    },
  },
  create: function(context) {
    const globalVars = new Map();
    const stack = {
      outputParam: null,
      outputProperties: [],
      inTriggerFunc: false,
    };
    /**
     * get all keys name from object literal expression
     * @param {(t.Property|t.SpreadElement)[]} props
     * @return {string[]}
     */
    const getAllKeys = (props) => {
      const propKeys = [];

      if (!props) return propKeys;

      props.forEach((prop) => {
        if (t.isProperty(prop)) {
          if (t.isIdentifier(prop.key))
            propKeys.push(prop.key.name);
          else if (t.isLiteral(prop.key))
            propKeys.push(prop.key.value);
        } else if (t.isSpreadElement(prop)) {
          if (t.isIdentifier(prop.argument)) {
            (globalVars.get(prop.argument.name) || [])
              .forEach((name) => propKeys.push(name));
          }
        }
      });
      return propKeys;
    };


    return {
      'Program > VariableDeclaration > VariableDeclarator > ObjectExpression'(node) {
        globalVars.set(node.parent.id.name, getAllKeys(node.properties));
      },
      [`Property[key.name=/${textProps.join('|')}/] > :function`](node) {
        const props = getAllKeys(node.parent.parent.properties);
        if (props.find((prop) => prop === 'outputStrings')) {
          stack.inTriggerFunc = true;
          stack.outputParam = node.params[2] && node.params[2].name;
          const outputValue = node.parent.parent.properties.find((prop) => prop.key && prop.key.name === 'outputStrings').value;
          stack.outputProperties =
            t.isIdentifier(outputValue)
              ? (globalVars.get(outputValue.name) || [])
              : getAllKeys(outputValue.properties);
          return;
        }
        context.report({
          node: node.parent.key,
          messageId: 'noOutputStrings',
        });
      },
      [`Property[key.name=/${textProps.join('|')}/] > :function:exit`]() {
        if (stack.inTriggerFunc) {
          stack.inTriggerFunc = false;
          stack.outputParam = null;
          stack.outputProperties = [];
        }
      },
      [`Property[key.name=/${textProps.join('|')}/] > :function[params.length=3] CallExpression > MemberExpression`](node) {
        if (node.object.name === stack.outputParam &&
          node.computed === false &&
          t.isIdentifier(node.property) &&
          !stack.outputProperties.includes(node.property.name)) {
          context.report({
            node: node,
            messageId: 'notFoundProperty',
            data: {
              prop: node.property.name,
              outputParam: stack.outputParam,
            },
          });
        }
      },
    };
  },
};

module.exports = ruleModule;
