"use strict";
/*
 * Elasticsearch B.V licenses this file to you under the MIT License.
 * See `packages/kbn-handlebars/LICENSE` for more information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEachCompileFunctionName = exports.expectTemplate = void 0;
const tslib_1 = require("tslib");
const __1 = tslib_1.__importDefault(require("../.."));
const compileFns = ['compile', 'compileAST'];
if (process.env.AST)
    compileFns.splice(0, 1);
else if (process.env.EVAL)
    compileFns.splice(1, 1);
global.kbnHandlebarsEnv = null;
function expectTemplate(template, options) {
    return new HandlebarsTestBench(template, options);
}
exports.expectTemplate = expectTemplate;
function forEachCompileFunctionName(cb) {
    compileFns.forEach(cb);
}
exports.forEachCompileFunctionName = forEachCompileFunctionName;
class HandlebarsTestBench {
    template;
    options;
    compileOptions;
    runtimeOptions;
    helpers = {};
    partials = {};
    decorators = {};
    input = {};
    constructor(template, options = {}) {
        this.template = template;
        this.options = options;
    }
    withCompileOptions(compileOptions) {
        this.compileOptions = compileOptions;
        return this;
    }
    withRuntimeOptions(runtimeOptions) {
        this.runtimeOptions = runtimeOptions;
        return this;
    }
    withInput(input) {
        this.input = input;
        return this;
    }
    withHelper(name, helper) {
        this.helpers[name] = helper;
        return this;
    }
    withHelpers(helperFunctions) {
        for (const [name, helper] of Object.entries(helperFunctions)) {
            this.withHelper(name, helper);
        }
        return this;
    }
    withPartial(name, partial) {
        this.partials[name] = partial;
        return this;
    }
    withPartials(partials) {
        for (const [name, partial] of Object.entries(partials)) {
            this.withPartial(name, partial);
        }
        return this;
    }
    withDecorator(name, decoratorFunction) {
        this.decorators[name] = decoratorFunction;
        return this;
    }
    withDecorators(decoratorFunctions) {
        for (const [name, decoratorFunction] of Object.entries(decoratorFunctions)) {
            this.withDecorator(name, decoratorFunction);
        }
        return this;
    }
    toCompileTo(outputExpected) {
        const { outputEval, outputAST } = this.compileAndExecute();
        if (process.env.EVAL) {
            expect(outputEval).toEqual(outputExpected);
        }
        else if (process.env.AST) {
            expect(outputAST).toEqual(outputExpected);
        }
        else {
            expect(outputAST).toEqual(outputExpected);
            expect(outputAST).toEqual(outputEval);
        }
    }
    toThrow(error) {
        if (process.env.EVAL) {
            expect(() => {
                this.compileAndExecuteEval();
            }).toThrowError(error);
        }
        else if (process.env.AST) {
            expect(() => {
                this.compileAndExecuteAST();
            }).toThrowError(error);
        }
        else {
            expect(() => {
                this.compileAndExecuteEval();
            }).toThrowError(error);
            expect(() => {
                this.compileAndExecuteAST();
            }).toThrowError(error);
        }
    }
    compileAndExecute() {
        if (process.env.EVAL) {
            return {
                outputEval: this.compileAndExecuteEval(),
            };
        }
        else if (process.env.AST) {
            return {
                outputAST: this.compileAndExecuteAST(),
            };
        }
        else {
            return {
                outputEval: this.compileAndExecuteEval(),
                outputAST: this.compileAndExecuteAST(),
            };
        }
    }
    compileAndExecuteEval() {
        const renderEval = this.compileEval();
        const runtimeOptions = {
            helpers: this.helpers,
            partials: this.partials,
            decorators: this.decorators,
            ...this.runtimeOptions,
        };
        this.execBeforeRender();
        return renderEval(this.input, runtimeOptions);
    }
    compileAndExecuteAST() {
        const renderAST = this.compileAST();
        const runtimeOptions = {
            helpers: this.helpers,
            partials: this.partials,
            decorators: this.decorators,
            ...this.runtimeOptions,
        };
        this.execBeforeRender();
        return renderAST(this.input, runtimeOptions);
    }
    compileEval(handlebarsEnv = getHandlebarsEnv()) {
        this.execBeforeEach();
        return handlebarsEnv.compile(this.template, this.compileOptions);
    }
    compileAST(handlebarsEnv = getHandlebarsEnv()) {
        this.execBeforeEach();
        return handlebarsEnv.compileAST(this.template, this.compileOptions);
    }
    execBeforeRender() {
        this.options.beforeRender?.();
    }
    execBeforeEach() {
        if (this.options.beforeEach) {
            this.options.beforeEach();
        }
    }
}
function getHandlebarsEnv() {
    return kbnHandlebarsEnv || __1.default.create();
}
