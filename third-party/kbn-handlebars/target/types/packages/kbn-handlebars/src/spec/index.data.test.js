"use strict";
/*
 * This file is forked from the handlebars project (https://github.com/handlebars-lang/handlebars.js),
 * and may include modifications made by Elasticsearch B.V.
 * Elasticsearch B.V. licenses this file to you under the MIT License.
 * See `packages/kbn-handlebars/LICENSE` for more information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const __1 = tslib_1.__importDefault(require("../.."));
const test_bench_1 = require("../__jest__/test_bench");
describe('data', () => {
    it('passing in data to a compiled function that expects data - works with helpers', () => {
        (0, test_bench_1.expectTemplate)('{{hello}}')
            .withCompileOptions({ data: true })
            .withHelper('hello', function (options) {
            return options.data.adjective + ' ' + this.noun;
        })
            .withRuntimeOptions({ data: { adjective: 'happy' } })
            .withInput({ noun: 'cat' })
            .toCompileTo('happy cat');
    });
    it('data can be looked up via @foo', () => {
        (0, test_bench_1.expectTemplate)('{{@hello}}')
            .withRuntimeOptions({ data: { hello: 'hello' } })
            .toCompileTo('hello');
    });
    it('deep @foo triggers automatic top-level data', () => {
        global.kbnHandlebarsEnv = __1.default.create();
        const helpers = __1.default.createFrame(kbnHandlebarsEnv.helpers);
        helpers.let = function (options) {
            const frame = __1.default.createFrame(options.data);
            for (const prop in options.hash) {
                if (prop in options.hash) {
                    frame[prop] = options.hash[prop];
                }
            }
            return options.fn(this, { data: frame });
        };
        (0, test_bench_1.expectTemplate)('{{#let world="world"}}{{#if foo}}{{#if foo}}Hello {{@world}}{{/if}}{{/if}}{{/let}}')
            .withInput({ foo: true })
            .withHelpers(helpers)
            .toCompileTo('Hello world');
        global.kbnHandlebarsEnv = null;
    });
    it('parameter data can be looked up via @foo', () => {
        (0, test_bench_1.expectTemplate)('{{hello @world}}')
            .withRuntimeOptions({ data: { world: 'world' } })
            .withHelper('hello', function (noun) {
            return 'Hello ' + noun;
        })
            .toCompileTo('Hello world');
    });
    it('hash values can be looked up via @foo', () => {
        (0, test_bench_1.expectTemplate)('{{hello noun=@world}}')
            .withRuntimeOptions({ data: { world: 'world' } })
            .withHelper('hello', function (options) {
            return 'Hello ' + options.hash.noun;
        })
            .toCompileTo('Hello world');
    });
    it('nested parameter data can be looked up via @foo.bar', () => {
        (0, test_bench_1.expectTemplate)('{{hello @world.bar}}')
            .withRuntimeOptions({ data: { world: { bar: 'world' } } })
            .withHelper('hello', function (noun) {
            return 'Hello ' + noun;
        })
            .toCompileTo('Hello world');
    });
    it('nested parameter data does not fail with @world.bar', () => {
        (0, test_bench_1.expectTemplate)('{{hello @world.bar}}')
            .withRuntimeOptions({ data: { foo: { bar: 'world' } } })
            .withHelper('hello', function (noun) {
            return 'Hello ' + noun;
        })
            .toCompileTo('Hello undefined');
    });
    it('parameter data throws when using complex scope references', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{text}} cruel {{@foo/../name}}! {{/goodbyes}}').toThrow(Error);
    });
    it('data can be functions', () => {
        (0, test_bench_1.expectTemplate)('{{@hello}}')
            .withRuntimeOptions({
            data: {
                hello() {
                    return 'hello';
                },
            },
        })
            .toCompileTo('hello');
    });
    it('data can be functions with params', () => {
        (0, test_bench_1.expectTemplate)('{{@hello "hello"}}')
            .withRuntimeOptions({
            data: {
                hello(arg) {
                    return arg;
                },
            },
        })
            .toCompileTo('hello');
    });
    it('data is inherited downstream', () => {
        (0, test_bench_1.expectTemplate)('{{#let foo=1 bar=2}}{{#let foo=bar.baz}}{{@bar}}{{@foo}}{{/let}}{{@foo}}{{/let}}')
            .withInput({ bar: { baz: 'hello world' } })
            .withCompileOptions({ data: true })
            .withHelper('let', function (options) {
            const frame = __1.default.createFrame(options.data);
            for (const prop in options.hash) {
                if (prop in options.hash) {
                    frame[prop] = options.hash[prop];
                }
            }
            return options.fn(this, { data: frame });
        })
            .withRuntimeOptions({ data: {} })
            .toCompileTo('2hello world1');
    });
    it('passing in data to a compiled function that expects data - works with helpers in partials', () => {
        (0, test_bench_1.expectTemplate)('{{>myPartial}}')
            .withCompileOptions({ data: true })
            .withPartial('myPartial', '{{hello}}')
            .withHelper('hello', function (options) {
            return options.data.adjective + ' ' + this.noun;
        })
            .withInput({ noun: 'cat' })
            .withRuntimeOptions({ data: { adjective: 'happy' } })
            .toCompileTo('happy cat');
    });
    it('passing in data to a compiled function that expects data - works with helpers and parameters', () => {
        (0, test_bench_1.expectTemplate)('{{hello world}}')
            .withCompileOptions({ data: true })
            .withHelper('hello', function (noun, options) {
            return options.data.adjective + ' ' + noun + (this.exclaim ? '!' : '');
        })
            .withInput({ exclaim: true, world: 'world' })
            .withRuntimeOptions({ data: { adjective: 'happy' } })
            .toCompileTo('happy world!');
    });
    it('passing in data to a compiled function that expects data - works with block helpers', () => {
        (0, test_bench_1.expectTemplate)('{{#hello}}{{world}}{{/hello}}')
            .withCompileOptions({
            data: true,
        })
            .withHelper('hello', function (options) {
            return options.fn(this);
        })
            .withHelper('world', function (options) {
            return options.data.adjective + ' world' + (this.exclaim ? '!' : '');
        })
            .withInput({ exclaim: true })
            .withRuntimeOptions({ data: { adjective: 'happy' } })
            .toCompileTo('happy world!');
    });
    it('passing in data to a compiled function that expects data - works with block helpers that use ..', () => {
        (0, test_bench_1.expectTemplate)('{{#hello}}{{world ../zomg}}{{/hello}}')
            .withCompileOptions({ data: true })
            .withHelper('hello', function (options) {
            return options.fn({ exclaim: '?' });
        })
            .withHelper('world', function (thing, options) {
            return options.data.adjective + ' ' + thing + (this.exclaim || '');
        })
            .withInput({ exclaim: true, zomg: 'world' })
            .withRuntimeOptions({ data: { adjective: 'happy' } })
            .toCompileTo('happy world?');
    });
    it('passing in data to a compiled function that expects data - data is passed to with block helpers where children use ..', () => {
        (0, test_bench_1.expectTemplate)('{{#hello}}{{world ../zomg}}{{/hello}}')
            .withCompileOptions({ data: true })
            .withHelper('hello', function (options) {
            return options.data.accessData + ' ' + options.fn({ exclaim: '?' });
        })
            .withHelper('world', function (thing, options) {
            return options.data.adjective + ' ' + thing + (this.exclaim || '');
        })
            .withInput({ exclaim: true, zomg: 'world' })
            .withRuntimeOptions({ data: { adjective: 'happy', accessData: '#win' } })
            .toCompileTo('#win happy world?');
    });
    it('you can override inherited data when invoking a helper', () => {
        (0, test_bench_1.expectTemplate)('{{#hello}}{{world zomg}}{{/hello}}')
            .withCompileOptions({ data: true })
            .withHelper('hello', function (options) {
            return options.fn({ exclaim: '?', zomg: 'world' }, { data: { adjective: 'sad' } });
        })
            .withHelper('world', function (thing, options) {
            return options.data.adjective + ' ' + thing + (this.exclaim || '');
        })
            .withInput({ exclaim: true, zomg: 'planet' })
            .withRuntimeOptions({ data: { adjective: 'happy' } })
            .toCompileTo('sad world?');
    });
    it('you can override inherited data when invoking a helper with depth', () => {
        (0, test_bench_1.expectTemplate)('{{#hello}}{{world ../zomg}}{{/hello}}')
            .withCompileOptions({ data: true })
            .withHelper('hello', function (options) {
            return options.fn({ exclaim: '?' }, { data: { adjective: 'sad' } });
        })
            .withHelper('world', function (thing, options) {
            return options.data.adjective + ' ' + thing + (this.exclaim || '');
        })
            .withInput({ exclaim: true, zomg: 'world' })
            .withRuntimeOptions({ data: { adjective: 'happy' } })
            .toCompileTo('sad world?');
    });
    describe('@root', () => {
        it('the root context can be looked up via @root', () => {
            (0, test_bench_1.expectTemplate)('{{@root.foo}}')
                .withInput({ foo: 'hello' })
                .withRuntimeOptions({ data: {} })
                .toCompileTo('hello');
            (0, test_bench_1.expectTemplate)('{{@root.foo}}').withInput({ foo: 'hello' }).toCompileTo('hello');
        });
        it('passed root values take priority', () => {
            (0, test_bench_1.expectTemplate)('{{@root.foo}}')
                .withInput({ foo: 'should not be used' })
                .withRuntimeOptions({ data: { root: { foo: 'hello' } } })
                .toCompileTo('hello');
        });
    });
    describe('nesting', () => {
        it('the root context can be looked up via @root', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{#helper}}{{@./depth}} {{@../depth}} {{@../../depth}}{{/helper}}{{/helper}}')
                .withInput({ foo: 'hello' })
                .withHelper('helper', function (options) {
                const frame = __1.default.createFrame(options.data);
                frame.depth = options.data.depth + 1;
                return options.fn(this, { data: frame });
            })
                .withRuntimeOptions({
                data: {
                    depth: 0,
                },
            })
                .toCompileTo('2 1 0');
        });
    });
});
