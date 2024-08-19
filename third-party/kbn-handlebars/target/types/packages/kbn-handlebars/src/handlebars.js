"use strict";
/*
 * Elasticsearch B.V licenses this file to you under the MIT License.
 * See `packages/kbn-handlebars/LICENSE` for more information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handlebars = void 0;
const tslib_1 = require("tslib");
// The handlebars module uses `export =`, so we should technically use `import Handlebars = require('handlebars')`, but Babel will not allow this:
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
const handlebars_1 = tslib_1.__importDefault(require("handlebars"));
exports.Handlebars = handlebars_1.default;
const visitor_1 = require("./visitor");
const originalCreate = handlebars_1.default.create;
/**
 * Creates an isolated Handlebars environment.
 *
 * Each environment has its own helpers.
 * This is only necessary for use cases that demand distinct helpers.
 * Most use cases can use the root Handlebars environment directly.
 *
 * @returns A sandboxed/scoped version of the @kbn/handlebars module
 */
handlebars_1.default.create = function () {
    const SandboxedHandlebars = originalCreate.call(handlebars_1.default);
    // When creating new Handlebars environments, ensure the custom compileAST function is present in the new environment as well
    SandboxedHandlebars.compileAST = handlebars_1.default.compileAST;
    return SandboxedHandlebars;
};
handlebars_1.default.compileAST = function (input, options) {
    if (input == null || (typeof input !== 'string' && input.type !== 'Program')) {
        throw new handlebars_1.default.Exception(`You must pass a string or Handlebars AST to Handlebars.compileAST. You passed ${input}`);
    }
    // If `Handlebars.compileAST` is reassigned, `this` will be undefined.
    const visitor = new visitor_1.ElasticHandlebarsVisitor(this ?? handlebars_1.default, input, options);
    return (context, runtimeOptions) => visitor.render(context, runtimeOptions);
};
