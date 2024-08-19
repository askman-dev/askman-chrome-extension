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
describe('security issues', () => {
    describe('GH-1495: Prevent Remote Code Execution via constructor', () => {
        it('should not allow constructors to be accessed', () => {
            (0, test_bench_1.expectTemplate)('{{lookup (lookup this "constructor") "name"}}').withInput({}).toCompileTo('');
            (0, test_bench_1.expectTemplate)('{{constructor.name}}').withInput({}).toCompileTo('');
        });
        it('GH-1603: should not allow constructors to be accessed (lookup via toString)', () => {
            (0, test_bench_1.expectTemplate)('{{lookup (lookup this (list "constructor")) "name"}}')
                .withInput({})
                .withHelper('list', function (element) {
                return [element];
            })
                .toCompileTo('');
        });
        it('should allow the "constructor" property to be accessed if it is an "ownProperty"', () => {
            (0, test_bench_1.expectTemplate)('{{constructor.name}}')
                .withInput({ constructor: { name: 'here we go' } })
                .toCompileTo('here we go');
            (0, test_bench_1.expectTemplate)('{{lookup (lookup this "constructor") "name"}}')
                .withInput({ constructor: { name: 'here we go' } })
                .toCompileTo('here we go');
        });
        it('should allow the "constructor" property to be accessed if it is an "own property"', () => {
            (0, test_bench_1.expectTemplate)('{{lookup (lookup this "constructor") "name"}}')
                .withInput({ constructor: { name: 'here we go' } })
                .toCompileTo('here we go');
        });
    });
    describe('GH-1558: Prevent explicit call of helperMissing-helpers', () => {
        describe('without the option "allowExplicitCallOfHelperMissing"', () => {
            it('should throw an exception when calling  "{{helperMissing}}" ', () => {
                (0, test_bench_1.expectTemplate)('{{helperMissing}}').toThrow(Error);
            });
            it('should throw an exception when calling  "{{#helperMissing}}{{/helperMissing}}" ', () => {
                (0, test_bench_1.expectTemplate)('{{#helperMissing}}{{/helperMissing}}').toThrow(Error);
            });
            it('should throw an exception when calling  "{{blockHelperMissing "abc" .}}" ', () => {
                const functionCalls = [];
                expect(() => {
                    const template = __1.default.compile('{{blockHelperMissing "abc" .}}');
                    template({
                        fn() {
                            functionCalls.push('called');
                        },
                    });
                }).toThrow(Error);
                expect(functionCalls.length).toEqual(0);
            });
            it('should throw an exception when calling  "{{#blockHelperMissing .}}{{/blockHelperMissing}}"', () => {
                (0, test_bench_1.expectTemplate)('{{#blockHelperMissing .}}{{/blockHelperMissing}}')
                    .withInput({
                    fn() {
                        return 'functionInData';
                    },
                })
                    .toThrow(Error);
            });
        });
    });
    describe('GH-1563', () => {
        it('should not allow to access constructor after overriding via __defineGetter__', () => {
            // @ts-expect-error
            if ({}.__defineGetter__ == null || {}.__lookupGetter__ == null) {
                return; // Browser does not support this exploit anyway
            }
            (0, test_bench_1.expectTemplate)('{{__defineGetter__ "undefined" valueOf }}' +
                '{{#with __lookupGetter__ }}' +
                '{{__defineGetter__ "propertyIsEnumerable" (this.bind (this.bind 1)) }}' +
                '{{constructor.name}}' +
                '{{/with}}')
                .withInput({})
                .toThrow(/Missing helper: "__defineGetter__"/);
        });
    });
    describe('GH-1595: dangerous properties', () => {
        const templates = [
            '{{constructor}}',
            '{{__defineGetter__}}',
            '{{__defineSetter__}}',
            '{{__lookupGetter__}}',
            '{{__proto__}}',
            '{{lookup this "constructor"}}',
            '{{lookup this "__defineGetter__"}}',
            '{{lookup this "__defineSetter__"}}',
            '{{lookup this "__lookupGetter__"}}',
            '{{lookup this "__proto__"}}',
        ];
        templates.forEach((template) => {
            describe('access should be denied to ' + template, () => {
                it('by default', () => {
                    (0, test_bench_1.expectTemplate)(template).withInput({}).toCompileTo('');
                });
            });
        });
    });
    describe('escapes template variables', () => {
        it('in default mode', () => {
            (0, test_bench_1.expectTemplate)("{{'a\\b'}}").withCompileOptions().withInput({ 'a\\b': 'c' }).toCompileTo('c');
        });
        it('in strict mode', () => {
            (0, test_bench_1.expectTemplate)("{{'a\\b'}}")
                .withCompileOptions({ strict: true })
                .withInput({ 'a\\b': 'c' })
                .toCompileTo('c');
        });
    });
});
