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
describe('subexpressions', () => {
    it('arg-less helper', () => {
        (0, test_bench_1.expectTemplate)('{{foo (bar)}}!')
            .withHelpers({
            foo(val) {
                return val + val;
            },
            bar() {
                return 'LOL';
            },
        })
            .toCompileTo('LOLLOL!');
    });
    it('helper w args', () => {
        (0, test_bench_1.expectTemplate)('{{blog (equal a b)}}')
            .withInput({ bar: 'LOL' })
            .withHelpers({
            blog(val) {
                return 'val is ' + val;
            },
            equal(x, y) {
                return x === y;
            },
        })
            .toCompileTo('val is true');
    });
    it('mixed paths and helpers', () => {
        (0, test_bench_1.expectTemplate)('{{blog baz.bat (equal a b) baz.bar}}')
            .withInput({ bar: 'LOL', baz: { bat: 'foo!', bar: 'bar!' } })
            .withHelpers({
            blog(val, that, theOther) {
                return 'val is ' + val + ', ' + that + ' and ' + theOther;
            },
            equal(x, y) {
                return x === y;
            },
        })
            .toCompileTo('val is foo!, true and bar!');
    });
    it('supports much nesting', () => {
        (0, test_bench_1.expectTemplate)('{{blog (equal (equal true true) true)}}')
            .withInput({ bar: 'LOL' })
            .withHelpers({
            blog(val) {
                return 'val is ' + val;
            },
            equal(x, y) {
                return x === y;
            },
        })
            .toCompileTo('val is true');
    });
    it('GH-800 : Complex subexpressions', () => {
        const context = { a: 'a', b: 'b', c: { c: 'c' }, d: 'd', e: { e: 'e' } };
        const helpers = {
            dash(a, b) {
                return a + '-' + b;
            },
            concat(a, b) {
                return a + b;
            },
        };
        (0, test_bench_1.expectTemplate)("{{dash 'abc' (concat a b)}}")
            .withInput(context)
            .withHelpers(helpers)
            .toCompileTo('abc-ab');
        (0, test_bench_1.expectTemplate)('{{dash d (concat a b)}}')
            .withInput(context)
            .withHelpers(helpers)
            .toCompileTo('d-ab');
        (0, test_bench_1.expectTemplate)('{{dash c.c (concat a b)}}')
            .withInput(context)
            .withHelpers(helpers)
            .toCompileTo('c-ab');
        (0, test_bench_1.expectTemplate)('{{dash (concat a b) c.c}}')
            .withInput(context)
            .withHelpers(helpers)
            .toCompileTo('ab-c');
        (0, test_bench_1.expectTemplate)('{{dash (concat a e.e) c.c}}')
            .withInput(context)
            .withHelpers(helpers)
            .toCompileTo('ae-c');
    });
    it('provides each nested helper invocation its own options hash', () => {
        let lastOptions;
        const helpers = {
            equal(x, y, options) {
                if (!options || options === lastOptions) {
                    throw new Error('options hash was reused');
                }
                lastOptions = options;
                return x === y;
            },
        };
        (0, test_bench_1.expectTemplate)('{{equal (equal true true) true}}').withHelpers(helpers).toCompileTo('true');
    });
    it('with hashes', () => {
        (0, test_bench_1.expectTemplate)("{{blog (equal (equal true true) true fun='yes')}}")
            .withInput({ bar: 'LOL' })
            .withHelpers({
            blog(val) {
                return 'val is ' + val;
            },
            equal(x, y) {
                return x === y;
            },
        })
            .toCompileTo('val is true');
    });
    it('as hashes', () => {
        (0, test_bench_1.expectTemplate)("{{blog fun=(equal (blog fun=1) 'val is 1')}}")
            .withHelpers({
            blog(options) {
                return 'val is ' + options.hash.fun;
            },
            equal(x, y) {
                return x === y;
            },
        })
            .toCompileTo('val is true');
    });
    it('multiple subexpressions in a hash', () => {
        (0, test_bench_1.expectTemplate)('{{input aria-label=(t "Name") placeholder=(t "Example User")}}')
            .withHelpers({
            input(options) {
                const hash = options.hash;
                const ariaLabel = __1.default.Utils.escapeExpression(hash['aria-label']);
                const placeholder = __1.default.Utils.escapeExpression(hash.placeholder);
                return new __1.default.SafeString('<input aria-label="' + ariaLabel + '" placeholder="' + placeholder + '" />');
            },
            t(defaultString) {
                return new __1.default.SafeString(defaultString);
            },
        })
            .toCompileTo('<input aria-label="Name" placeholder="Example User" />');
    });
    it('multiple subexpressions in a hash with context', () => {
        (0, test_bench_1.expectTemplate)('{{input aria-label=(t item.field) placeholder=(t item.placeholder)}}')
            .withInput({
            item: {
                field: 'Name',
                placeholder: 'Example User',
            },
        })
            .withHelpers({
            input(options) {
                const hash = options.hash;
                const ariaLabel = __1.default.Utils.escapeExpression(hash['aria-label']);
                const placeholder = __1.default.Utils.escapeExpression(hash.placeholder);
                return new __1.default.SafeString('<input aria-label="' + ariaLabel + '" placeholder="' + placeholder + '" />');
            },
            t(defaultString) {
                return new __1.default.SafeString(defaultString);
            },
        })
            .toCompileTo('<input aria-label="Name" placeholder="Example User" />');
    });
    it('subexpression functions on the context', () => {
        (0, test_bench_1.expectTemplate)('{{foo (bar)}}!')
            .withInput({
            bar() {
                return 'LOL';
            },
        })
            .withHelpers({
            foo(val) {
                return val + val;
            },
        })
            .toCompileTo('LOLLOL!');
    });
    it("subexpressions can't just be property lookups", () => {
        (0, test_bench_1.expectTemplate)('{{foo (bar)}}!')
            .withInput({
            bar: 'LOL',
        })
            .withHelpers({
            foo(val) {
                return val + val;
            },
        })
            .toThrow();
    });
});
