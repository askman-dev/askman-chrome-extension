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
describe('blocks', () => {
    it('array', () => {
        const string = '{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!';
        (0, test_bench_1.expectTemplate)(string)
            .withInput({
            goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
            world: 'world',
        })
            .toCompileTo('goodbye! Goodbye! GOODBYE! cruel world!');
        (0, test_bench_1.expectTemplate)(string)
            .withInput({
            goodbyes: [],
            world: 'world',
        })
            .toCompileTo('cruel world!');
    });
    it('array without data', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{text}}{{/goodbyes}} {{#goodbyes}}{{text}}{{/goodbyes}}')
            .withInput({
            goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
            world: 'world',
        })
            .toCompileTo('goodbyeGoodbyeGOODBYE goodbyeGoodbyeGOODBYE');
    });
    it('array with @index', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{@index}}. {{text}}! {{/goodbyes}}cruel {{world}}!')
            .withInput({
            goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
            world: 'world',
        })
            .toCompileTo('0. goodbye! 1. Goodbye! 2. GOODBYE! cruel world!');
    });
    it('empty block', () => {
        const string = '{{#goodbyes}}{{/goodbyes}}cruel {{world}}!';
        (0, test_bench_1.expectTemplate)(string)
            .withInput({
            goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
            world: 'world',
        })
            .toCompileTo('cruel world!');
        (0, test_bench_1.expectTemplate)(string)
            .withInput({
            goodbyes: [],
            world: 'world',
        })
            .toCompileTo('cruel world!');
    });
    it('block with complex lookup', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{text}} cruel {{../name}}! {{/goodbyes}}')
            .withInput({
            name: 'Alan',
            goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
        })
            .toCompileTo('goodbye cruel Alan! Goodbye cruel Alan! GOODBYE cruel Alan! ');
    });
    it('multiple blocks with complex lookup', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{../name}}{{../name}}{{/goodbyes}}')
            .withInput({
            name: 'Alan',
            goodbyes: [{ text: 'goodbye' }, { text: 'Goodbye' }, { text: 'GOODBYE' }],
        })
            .toCompileTo('AlanAlanAlanAlanAlanAlan');
    });
    it('block with complex lookup using nested context', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{text}} cruel {{foo/../name}}! {{/goodbyes}}').toThrow(Error);
    });
    it('block with deep nested complex lookup', () => {
        (0, test_bench_1.expectTemplate)('{{#outer}}Goodbye {{#inner}}cruel {{../sibling}} {{../../omg}}{{/inner}}{{/outer}}')
            .withInput({
            omg: 'OMG!',
            outer: [{ sibling: 'sad', inner: [{ text: 'goodbye' }] }],
        })
            .toCompileTo('Goodbye cruel sad OMG!');
    });
    it('works with cached blocks', () => {
        (0, test_bench_1.expectTemplate)('{{#each person}}{{#with .}}{{first}} {{last}}{{/with}}{{/each}}')
            .withCompileOptions({ data: false })
            .withInput({
            person: [
                { first: 'Alan', last: 'Johnson' },
                { first: 'Alan', last: 'Johnson' },
            ],
        })
            .toCompileTo('Alan JohnsonAlan Johnson');
    });
    describe('inverted sections', () => {
        it('inverted sections with unset value', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}').toCompileTo('Right On!');
        });
        it('inverted section with false value', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}')
                .withInput({ goodbyes: false })
                .toCompileTo('Right On!');
        });
        it('inverted section with empty set', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{this}}{{/goodbyes}}{{^goodbyes}}Right On!{{/goodbyes}}')
                .withInput({ goodbyes: [] })
                .toCompileTo('Right On!');
        });
        it('block inverted sections', () => {
            (0, test_bench_1.expectTemplate)('{{#people}}{{name}}{{^}}{{none}}{{/people}}')
                .withInput({ none: 'No people' })
                .toCompileTo('No people');
        });
        it('chained inverted sections', () => {
            (0, test_bench_1.expectTemplate)('{{#people}}{{name}}{{else if none}}{{none}}{{/people}}')
                .withInput({ none: 'No people' })
                .toCompileTo('No people');
            (0, test_bench_1.expectTemplate)('{{#people}}{{name}}{{else if nothere}}fail{{else unless nothere}}{{none}}{{/people}}')
                .withInput({ none: 'No people' })
                .toCompileTo('No people');
            (0, test_bench_1.expectTemplate)('{{#people}}{{name}}{{else if none}}{{none}}{{else}}fail{{/people}}')
                .withInput({ none: 'No people' })
                .toCompileTo('No people');
        });
        it('chained inverted sections with mismatch', () => {
            (0, test_bench_1.expectTemplate)('{{#people}}{{name}}{{else if none}}{{none}}{{/if}}').toThrow(Error);
        });
        it('block inverted sections with empty arrays', () => {
            (0, test_bench_1.expectTemplate)('{{#people}}{{name}}{{^}}{{none}}{{/people}}')
                .withInput({
                none: 'No people',
                people: [],
            })
                .toCompileTo('No people');
        });
    });
    describe('standalone sections', () => {
        it('block standalone else sections', () => {
            (0, test_bench_1.expectTemplate)('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n')
                .withInput({ none: 'No people' })
                .toCompileTo('No people\n');
            (0, test_bench_1.expectTemplate)('{{#none}}\n{{.}}\n{{^}}\n{{none}}\n{{/none}}\n')
                .withInput({ none: 'No people' })
                .toCompileTo('No people\n');
            (0, test_bench_1.expectTemplate)('{{#people}}\n{{name}}\n{{^}}\n{{none}}\n{{/people}}\n')
                .withInput({ none: 'No people' })
                .toCompileTo('No people\n');
        });
        it('block standalone chained else sections', () => {
            (0, test_bench_1.expectTemplate)('{{#people}}\n{{name}}\n{{else if none}}\n{{none}}\n{{/people}}\n')
                .withInput({ none: 'No people' })
                .toCompileTo('No people\n');
            (0, test_bench_1.expectTemplate)('{{#people}}\n{{name}}\n{{else if none}}\n{{none}}\n{{^}}\n{{/people}}\n')
                .withInput({ none: 'No people' })
                .toCompileTo('No people\n');
        });
        it('should handle nesting', () => {
            (0, test_bench_1.expectTemplate)('{{#data}}\n{{#if true}}\n{{.}}\n{{/if}}\n{{/data}}\nOK.')
                .withInput({
                data: [1, 3, 5],
            })
                .toCompileTo('1\n3\n5\nOK.');
        });
    });
    describe('decorators', () => {
        it('should apply mustache decorators', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{*decorator}}{{/helper}}')
                .withHelper('helper', function (options) {
                return options.fn.run;
            })
                .withDecorator('decorator', function (fn) {
                fn.run = 'success';
                return fn;
            })
                .toCompileTo('success');
        });
        it('should apply allow undefined return', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{*decorator}}suc{{/helper}}')
                .withHelper('helper', function (options) {
                return options.fn() + options.fn.run;
            })
                .withDecorator('decorator', function (fn) {
                fn.run = 'cess';
            })
                .toCompileTo('success');
        });
        it('should apply block decorators', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{#*decorator}}success{{/decorator}}{{/helper}}')
                .withHelper('helper', function (options) {
                return options.fn.run;
            })
                .withDecorator('decorator', function (fn, props, container, options) {
                fn.run = options.fn();
                return fn;
            })
                .toCompileTo('success');
        });
        it('should support nested decorators', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{#*decorator}}{{#*nested}}suc{{/nested}}cess{{/decorator}}{{/helper}}')
                .withHelper('helper', function (options) {
                return options.fn.run;
            })
                .withDecorators({
                decorator(fn, props, container, options) {
                    fn.run = options.fn.nested + options.fn();
                    return fn;
                },
                nested(fn, props, container, options) {
                    props.nested = options.fn();
                },
            })
                .toCompileTo('success');
        });
        it('should apply multiple decorators', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{#*decorator}}suc{{/decorator}}{{#*decorator}}cess{{/decorator}}{{/helper}}')
                .withHelper('helper', function (options) {
                return options.fn.run;
            })
                .withDecorator('decorator', function (fn, props, container, options) {
                fn.run = (fn.run || '') + options.fn();
                return fn;
            })
                .toCompileTo('success');
        });
        it('should access parent variables', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{*decorator foo}}{{/helper}}')
                .withHelper('helper', function (options) {
                return options.fn.run;
            })
                .withDecorator('decorator', function (fn, props, container, options) {
                fn.run = options.args;
                return fn;
            })
                .withInput({ foo: 'success' })
                .toCompileTo('success');
        });
        it('should work with root program', () => {
            let run;
            (0, test_bench_1.expectTemplate)('{{*decorator "success"}}')
                .withDecorator('decorator', function (fn, props, container, options) {
                expect(options.args[0]).toEqual('success');
                run = true;
                return fn;
            })
                .withInput({ foo: 'success' })
                .toCompileTo('');
            expect(run).toEqual(true);
        });
        it('should fail when accessing variables from root', () => {
            let run;
            (0, test_bench_1.expectTemplate)('{{*decorator foo}}')
                .withDecorator('decorator', function (fn, props, container, options) {
                expect(options.args[0]).toBeUndefined();
                run = true;
                return fn;
            })
                .withInput({ foo: 'fail' })
                .toCompileTo('');
            expect(run).toEqual(true);
        });
        describe('registration', () => {
            beforeEach(() => {
                global.kbnHandlebarsEnv = __1.default.create();
            });
            afterEach(() => {
                global.kbnHandlebarsEnv = null;
            });
            it('unregisters', () => {
                // @ts-expect-error: Cannot assign to 'decorators' because it is a read-only property.
                kbnHandlebarsEnv.decorators = {};
                kbnHandlebarsEnv.registerDecorator('foo', function () {
                    return 'fail';
                });
                expect(!!kbnHandlebarsEnv.decorators.foo).toEqual(true);
                kbnHandlebarsEnv.unregisterDecorator('foo');
                expect(kbnHandlebarsEnv.decorators.foo).toBeUndefined();
            });
            it('allows multiple globals', () => {
                // @ts-expect-error: Cannot assign to 'decorators' because it is a read-only property.
                kbnHandlebarsEnv.decorators = {};
                // @ts-expect-error: Expected 2 arguments, but got 1.
                kbnHandlebarsEnv.registerDecorator({
                    foo() { },
                    bar() { },
                });
                expect(!!kbnHandlebarsEnv.decorators.foo).toEqual(true);
                expect(!!kbnHandlebarsEnv.decorators.bar).toEqual(true);
                kbnHandlebarsEnv.unregisterDecorator('foo');
                kbnHandlebarsEnv.unregisterDecorator('bar');
                expect(kbnHandlebarsEnv.decorators.foo).toBeUndefined();
                expect(kbnHandlebarsEnv.decorators.bar).toBeUndefined();
            });
            it('fails with multiple and args', () => {
                expect(() => {
                    kbnHandlebarsEnv.registerDecorator(
                    // @ts-expect-error: Argument of type '{ world(): string; testHelper(): string; }' is not assignable to parameter of type 'string'.
                    {
                        world() {
                            return 'world!';
                        },
                        testHelper() {
                            return 'found it!';
                        },
                    }, {});
                }).toThrow('Arg not supported with multiple decorators');
            });
        });
    });
});
