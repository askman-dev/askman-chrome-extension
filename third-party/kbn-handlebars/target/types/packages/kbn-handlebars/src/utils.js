"use strict";
/*
 * Elasticsearch B.V licenses this file to you under the MIT License.
 * See `packages/kbn-handlebars/LICENSE` for more information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowUnsafeEval = exports.transformLiteralToPath = exports.initData = exports.noop = exports.toDecoratorOptions = exports.isDecorator = exports.isBlock = void 0;
// @ts-expect-error: Could not find a declaration file for module
const utils_1 = require("handlebars/dist/cjs/handlebars/utils");
function isBlock(node) {
    return 'program' in node || 'inverse' in node;
}
exports.isBlock = isBlock;
function isDecorator(node) {
    return node.type === 'Decorator' || node.type === 'DecoratorBlock';
}
exports.isDecorator = isDecorator;
function toDecoratorOptions(options) {
    // There's really no tests/documentation on this, but to match the upstream codebase we'll remove `lookupProperty` from the decorator context
    delete options.lookupProperty;
    return options;
}
exports.toDecoratorOptions = toDecoratorOptions;
function noop() {
    return '';
}
exports.noop = noop;
// liftet from handlebars lib/handlebars/runtime.js
function initData(context, data) {
    if (!data || !('root' in data)) {
        data = data ? (0, utils_1.createFrame)(data) : {};
        data.root = context;
    }
    return data;
}
exports.initData = initData;
// liftet from handlebars lib/handlebars/compiler/compiler.js
function transformLiteralToPath(node) {
    const pathIsLiteral = 'parts' in node.path === false;
    if (pathIsLiteral) {
        const literal = node.path;
        // @ts-expect-error: Not all `hbs.AST.Literal` sub-types has an `original` property, but that's ok, in that case we just want `undefined`
        const original = literal.original;
        // Casting to string here to make false and 0 literal values play nicely with the rest
        // of the system.
        node.path = {
            type: 'PathExpression',
            data: false,
            depth: 0,
            parts: [original + ''],
            original: original + '',
            loc: literal.loc,
        };
    }
}
exports.transformLiteralToPath = transformLiteralToPath;
function allowUnsafeEval() {
    try {
        new Function();
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.allowUnsafeEval = allowUnsafeEval;
