"use strict";
/*
 * This file is forked from the handlebars project (https://github.com/handlebars-lang/handlebars.js),
 * and may include modifications made by Elasticsearch B.V.
 * Elasticsearch B.V. licenses this file to you under the MIT License.
 * See `packages/kbn-handlebars/LICENSE` for more information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const test_bench_1 = require("../__jest__/test_bench");
describe('strict', () => {
    describe('strict mode', () => {
        it('should error on missing property lookup', () => {
            (0, test_bench_1.expectTemplate)('{{hello}}')
                .withCompileOptions({ strict: true })
                .toThrow(/"hello" not defined in/);
        });
        it('should error on missing child', () => {
            (0, test_bench_1.expectTemplate)('{{hello.bar}}')
                .withCompileOptions({ strict: true })
                .withInput({ hello: { bar: 'foo' } })
                .toCompileTo('foo');
            (0, test_bench_1.expectTemplate)('{{hello.bar}}')
                .withCompileOptions({ strict: true })
                .withInput({ hello: {} })
                .toThrow(/"bar" not defined in/);
        });
        it('should handle explicit undefined', () => {
            (0, test_bench_1.expectTemplate)('{{hello.bar}}')
                .withCompileOptions({ strict: true })
                .withInput({ hello: { bar: undefined } })
                .toCompileTo('');
        });
        it('should error on missing property lookup in known helpers mode', () => {
            (0, test_bench_1.expectTemplate)('{{hello}}')
                .withCompileOptions({
                strict: true,
                knownHelpersOnly: true,
            })
                .toThrow(/"hello" not defined in/);
        });
        it('should error on missing context', () => {
            (0, test_bench_1.expectTemplate)('{{hello}}').withCompileOptions({ strict: true }).toThrow(Error);
        });
        it('should error on missing data lookup', () => {
            const xt = (0, test_bench_1.expectTemplate)('{{@hello}}').withCompileOptions({
                strict: true,
            });
            xt.toThrow(Error);
            xt.withRuntimeOptions({ data: { hello: 'foo' } }).toCompileTo('foo');
        });
        it('should not run helperMissing for helper calls', () => {
            (0, test_bench_1.expectTemplate)('{{hello foo}}')
                .withCompileOptions({ strict: true })
                .withInput({ foo: true })
                .toThrow(/"hello" not defined in/);
            (0, test_bench_1.expectTemplate)('{{#hello foo}}{{/hello}}')
                .withCompileOptions({ strict: true })
                .withInput({ foo: true })
                .toThrow(/"hello" not defined in/);
        });
        it('should throw on ambiguous blocks', () => {
            (0, test_bench_1.expectTemplate)('{{#hello}}{{/hello}}')
                .withCompileOptions({ strict: true })
                .toThrow(/"hello" not defined in/);
            (0, test_bench_1.expectTemplate)('{{^hello}}{{/hello}}')
                .withCompileOptions({ strict: true })
                .toThrow(/"hello" not defined in/);
            (0, test_bench_1.expectTemplate)('{{#hello.bar}}{{/hello.bar}}')
                .withCompileOptions({ strict: true })
                .withInput({ hello: {} })
                .toThrow(/"bar" not defined in/);
        });
        it('should allow undefined parameters when passed to helpers', () => {
            (0, test_bench_1.expectTemplate)('{{#unless foo}}success{{/unless}}')
                .withCompileOptions({ strict: true })
                .toCompileTo('success');
        });
        it('should allow undefined hash when passed to helpers', () => {
            (0, test_bench_1.expectTemplate)('{{helper value=@foo}}')
                .withCompileOptions({
                strict: true,
            })
                .withHelpers({
                helper(options) {
                    expect('value' in options.hash).toEqual(true);
                    expect(options.hash.value).toBeUndefined();
                    return 'success';
                },
            })
                .toCompileTo('success');
        });
        it('should show error location on missing property lookup', () => {
            (0, test_bench_1.expectTemplate)('\n\n\n   {{hello}}')
                .withCompileOptions({ strict: true })
                .toThrow('"hello" not defined in [object Object] - 4:5');
        });
        it('should error contains correct location properties on missing property lookup', () => {
            try {
                (0, test_bench_1.expectTemplate)('\n\n\n   {{hello}}')
                    .withCompileOptions({ strict: true })
                    .toCompileTo('throw before asserting this');
            }
            catch (error) {
                expect(error.lineNumber).toEqual(4);
                expect(error.endLineNumber).toEqual(4);
                expect(error.column).toEqual(5);
                expect(error.endColumn).toEqual(10);
            }
        });
    });
    describe('assume objects', () => {
        it('should ignore missing property', () => {
            (0, test_bench_1.expectTemplate)('{{hello}}').withCompileOptions({ assumeObjects: true }).toCompileTo('');
        });
        it('should ignore missing child', () => {
            (0, test_bench_1.expectTemplate)('{{hello.bar}}')
                .withCompileOptions({ assumeObjects: true })
                .withInput({ hello: {} })
                .toCompileTo('');
        });
        it('should error on missing object', () => {
            (0, test_bench_1.expectTemplate)('{{hello.bar}}').withCompileOptions({ assumeObjects: true }).toThrow(Error);
        });
        it('should error on missing context', () => {
            (0, test_bench_1.expectTemplate)('{{hello}}')
                .withCompileOptions({ assumeObjects: true })
                .withInput(undefined)
                .toThrow(Error);
        });
        it('should error on missing data lookup', () => {
            (0, test_bench_1.expectTemplate)('{{@hello.bar}}')
                .withCompileOptions({ assumeObjects: true })
                .withInput(undefined)
                .toThrow(Error);
        });
        it('should execute blockHelperMissing', () => {
            (0, test_bench_1.expectTemplate)('{{^hello}}foo{{/hello}}')
                .withCompileOptions({ assumeObjects: true })
                .toCompileTo('foo');
        });
    });
});
