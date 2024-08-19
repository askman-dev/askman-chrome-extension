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
describe('basic context', () => {
    it('most basic', () => {
        (0, test_bench_1.expectTemplate)('{{foo}}').withInput({ foo: 'foo' }).toCompileTo('foo');
    });
    it('escaping', () => {
        (0, test_bench_1.expectTemplate)('\\{{foo}}').withInput({ foo: 'food' }).toCompileTo('{{foo}}');
        (0, test_bench_1.expectTemplate)('content \\{{foo}}').withInput({ foo: 'food' }).toCompileTo('content {{foo}}');
        (0, test_bench_1.expectTemplate)('\\\\{{foo}}').withInput({ foo: 'food' }).toCompileTo('\\food');
        (0, test_bench_1.expectTemplate)('content \\\\{{foo}}').withInput({ foo: 'food' }).toCompileTo('content \\food');
        (0, test_bench_1.expectTemplate)('\\\\ {{foo}}').withInput({ foo: 'food' }).toCompileTo('\\\\ food');
    });
    it('compiling with a basic context', () => {
        (0, test_bench_1.expectTemplate)('Goodbye\n{{cruel}}\n{{world}}!')
            .withInput({
            cruel: 'cruel',
            world: 'world',
        })
            .toCompileTo('Goodbye\ncruel\nworld!');
    });
    it('compiling with a string context', () => {
        (0, test_bench_1.expectTemplate)('{{.}}{{length}}').withInput('bye').toCompileTo('bye3');
    });
    it('compiling with an undefined context', () => {
        (0, test_bench_1.expectTemplate)('Goodbye\n{{cruel}}\n{{world.bar}}!')
            .withInput(undefined)
            .toCompileTo('Goodbye\n\n!');
        (0, test_bench_1.expectTemplate)('{{#unless foo}}Goodbye{{../test}}{{test2}}{{/unless}}')
            .withInput(undefined)
            .toCompileTo('Goodbye');
    });
    it('comments', () => {
        (0, test_bench_1.expectTemplate)('{{! Goodbye}}Goodbye\n{{cruel}}\n{{world}}!')
            .withInput({
            cruel: 'cruel',
            world: 'world',
        })
            .toCompileTo('Goodbye\ncruel\nworld!');
        (0, test_bench_1.expectTemplate)('    {{~! comment ~}}      blah').toCompileTo('blah');
        (0, test_bench_1.expectTemplate)('    {{~!-- long-comment --~}}      blah').toCompileTo('blah');
        (0, test_bench_1.expectTemplate)('    {{! comment ~}}      blah').toCompileTo('    blah');
        (0, test_bench_1.expectTemplate)('    {{!-- long-comment --~}}      blah').toCompileTo('    blah');
        (0, test_bench_1.expectTemplate)('    {{~! comment}}      blah').toCompileTo('      blah');
        (0, test_bench_1.expectTemplate)('    {{~!-- long-comment --}}      blah').toCompileTo('      blah');
    });
    it('boolean', () => {
        const string = '{{#goodbye}}GOODBYE {{/goodbye}}cruel {{world}}!';
        (0, test_bench_1.expectTemplate)(string)
            .withInput({
            goodbye: true,
            world: 'world',
        })
            .toCompileTo('GOODBYE cruel world!');
        (0, test_bench_1.expectTemplate)(string)
            .withInput({
            goodbye: false,
            world: 'world',
        })
            .toCompileTo('cruel world!');
    });
    it('zeros', () => {
        (0, test_bench_1.expectTemplate)('num1: {{num1}}, num2: {{num2}}')
            .withInput({
            num1: 42,
            num2: 0,
        })
            .toCompileTo('num1: 42, num2: 0');
        (0, test_bench_1.expectTemplate)('num: {{.}}').withInput(0).toCompileTo('num: 0');
        (0, test_bench_1.expectTemplate)('num: {{num1/num2}}')
            .withInput({ num1: { num2: 0 } })
            .toCompileTo('num: 0');
    });
    it('false', () => {
        /* eslint-disable no-new-wrappers */
        (0, test_bench_1.expectTemplate)('val1: {{val1}}, val2: {{val2}}')
            .withInput({
            val1: false,
            val2: new Boolean(false),
        })
            .toCompileTo('val1: false, val2: false');
        (0, test_bench_1.expectTemplate)('val: {{.}}').withInput(false).toCompileTo('val: false');
        (0, test_bench_1.expectTemplate)('val: {{val1/val2}}')
            .withInput({ val1: { val2: false } })
            .toCompileTo('val: false');
        (0, test_bench_1.expectTemplate)('val1: {{{val1}}}, val2: {{{val2}}}')
            .withInput({
            val1: false,
            val2: new Boolean(false),
        })
            .toCompileTo('val1: false, val2: false');
        (0, test_bench_1.expectTemplate)('val: {{{val1/val2}}}')
            .withInput({ val1: { val2: false } })
            .toCompileTo('val: false');
        /* eslint-enable */
    });
    it('should handle undefined and null', () => {
        (0, test_bench_1.expectTemplate)('{{awesome undefined null}}')
            .withInput({
            awesome(_undefined, _null, options) {
                return (_undefined === undefined) + ' ' + (_null === null) + ' ' + typeof options;
            },
        })
            .toCompileTo('true true object');
        (0, test_bench_1.expectTemplate)('{{undefined}}')
            .withInput({
            undefined() {
                return 'undefined!';
            },
        })
            .toCompileTo('undefined!');
        (0, test_bench_1.expectTemplate)('{{null}}')
            .withInput({
            null() {
                return 'null!';
            },
        })
            .toCompileTo('null!');
    });
    it('newlines', () => {
        (0, test_bench_1.expectTemplate)("Alan's\nTest").toCompileTo("Alan's\nTest");
        (0, test_bench_1.expectTemplate)("Alan's\rTest").toCompileTo("Alan's\rTest");
    });
    it('escaping text', () => {
        (0, test_bench_1.expectTemplate)("Awesome's").toCompileTo("Awesome's");
        (0, test_bench_1.expectTemplate)('Awesome\\').toCompileTo('Awesome\\');
        (0, test_bench_1.expectTemplate)('Awesome\\\\ foo').toCompileTo('Awesome\\\\ foo');
        (0, test_bench_1.expectTemplate)('Awesome {{foo}}').withInput({ foo: '\\' }).toCompileTo('Awesome \\');
        (0, test_bench_1.expectTemplate)(" ' ' ").toCompileTo(" ' ' ");
    });
    it('escaping expressions', () => {
        (0, test_bench_1.expectTemplate)('{{{awesome}}}').withInput({ awesome: "&'\\<>" }).toCompileTo("&'\\<>");
        (0, test_bench_1.expectTemplate)('{{&awesome}}').withInput({ awesome: "&'\\<>" }).toCompileTo("&'\\<>");
        (0, test_bench_1.expectTemplate)('{{awesome}}')
            .withInput({ awesome: '&"\'`\\<>' })
            .toCompileTo('&amp;&quot;&#x27;&#x60;\\&lt;&gt;');
        (0, test_bench_1.expectTemplate)('{{awesome}}')
            .withInput({ awesome: 'Escaped, <b> looks like: &lt;b&gt;' })
            .toCompileTo('Escaped, &lt;b&gt; looks like: &amp;lt;b&amp;gt;');
    });
    it("functions returning safestrings shouldn't be escaped", () => {
        (0, test_bench_1.expectTemplate)('{{awesome}}')
            .withInput({
            awesome() {
                return new __1.default.SafeString("&'\\<>");
            },
        })
            .toCompileTo("&'\\<>");
    });
    it('functions', () => {
        (0, test_bench_1.expectTemplate)('{{awesome}}')
            .withInput({
            awesome() {
                return 'Awesome';
            },
        })
            .toCompileTo('Awesome');
        (0, test_bench_1.expectTemplate)('{{awesome}}')
            .withInput({
            awesome() {
                return this.more;
            },
            more: 'More awesome',
        })
            .toCompileTo('More awesome');
    });
    it('functions with context argument', () => {
        (0, test_bench_1.expectTemplate)('{{awesome frank}}')
            .withInput({
            awesome(context) {
                return context;
            },
            frank: 'Frank',
        })
            .toCompileTo('Frank');
    });
    it('pathed functions with context argument', () => {
        (0, test_bench_1.expectTemplate)('{{bar.awesome frank}}')
            .withInput({
            bar: {
                awesome(context) {
                    return context;
                },
            },
            frank: 'Frank',
        })
            .toCompileTo('Frank');
    });
    it('depthed functions with context argument', () => {
        (0, test_bench_1.expectTemplate)('{{#with frank}}{{../awesome .}}{{/with}}')
            .withInput({
            awesome(context) {
                return context;
            },
            frank: 'Frank',
        })
            .toCompileTo('Frank');
    });
    it('block functions with context argument', () => {
        (0, test_bench_1.expectTemplate)('{{#awesome 1}}inner {{.}}{{/awesome}}')
            .withInput({
            awesome(context, options) {
                return options.fn(context);
            },
        })
            .toCompileTo('inner 1');
    });
    it('depthed block functions with context argument', () => {
        (0, test_bench_1.expectTemplate)('{{#with value}}{{#../awesome 1}}inner {{.}}{{/../awesome}}{{/with}}')
            .withInput({
            value: true,
            awesome(context, options) {
                return options.fn(context);
            },
        })
            .toCompileTo('inner 1');
    });
    it('block functions without context argument', () => {
        (0, test_bench_1.expectTemplate)('{{#awesome}}inner{{/awesome}}')
            .withInput({
            awesome(options) {
                return options.fn(this);
            },
        })
            .toCompileTo('inner');
    });
    it('pathed block functions without context argument', () => {
        (0, test_bench_1.expectTemplate)('{{#foo.awesome}}inner{{/foo.awesome}}')
            .withInput({
            foo: {
                awesome() {
                    return this;
                },
            },
        })
            .toCompileTo('inner');
    });
    it('depthed block functions without context argument', () => {
        (0, test_bench_1.expectTemplate)('{{#with value}}{{#../awesome}}inner{{/../awesome}}{{/with}}')
            .withInput({
            value: true,
            awesome() {
                return this;
            },
        })
            .toCompileTo('inner');
    });
    it('paths with hyphens', () => {
        (0, test_bench_1.expectTemplate)('{{foo-bar}}').withInput({ 'foo-bar': 'baz' }).toCompileTo('baz');
        (0, test_bench_1.expectTemplate)('{{foo.foo-bar}}')
            .withInput({ foo: { 'foo-bar': 'baz' } })
            .toCompileTo('baz');
        (0, test_bench_1.expectTemplate)('{{foo/foo-bar}}')
            .withInput({ foo: { 'foo-bar': 'baz' } })
            .toCompileTo('baz');
    });
    it('nested paths', () => {
        (0, test_bench_1.expectTemplate)('Goodbye {{alan/expression}} world!')
            .withInput({ alan: { expression: 'beautiful' } })
            .toCompileTo('Goodbye beautiful world!');
    });
    it('nested paths with empty string value', () => {
        (0, test_bench_1.expectTemplate)('Goodbye {{alan/expression}} world!')
            .withInput({ alan: { expression: '' } })
            .toCompileTo('Goodbye  world!');
    });
    it('literal paths', () => {
        (0, test_bench_1.expectTemplate)('Goodbye {{[@alan]/expression}} world!')
            .withInput({ '@alan': { expression: 'beautiful' } })
            .toCompileTo('Goodbye beautiful world!');
        (0, test_bench_1.expectTemplate)('Goodbye {{[foo bar]/expression}} world!')
            .withInput({ 'foo bar': { expression: 'beautiful' } })
            .toCompileTo('Goodbye beautiful world!');
    });
    it('literal references', () => {
        (0, test_bench_1.expectTemplate)('Goodbye {{[foo bar]}} world!')
            .withInput({ 'foo bar': 'beautiful' })
            .toCompileTo('Goodbye beautiful world!');
        (0, test_bench_1.expectTemplate)('Goodbye {{"foo bar"}} world!')
            .withInput({ 'foo bar': 'beautiful' })
            .toCompileTo('Goodbye beautiful world!');
        (0, test_bench_1.expectTemplate)("Goodbye {{'foo bar'}} world!")
            .withInput({ 'foo bar': 'beautiful' })
            .toCompileTo('Goodbye beautiful world!');
        (0, test_bench_1.expectTemplate)('Goodbye {{"foo[bar"}} world!')
            .withInput({ 'foo[bar': 'beautiful' })
            .toCompileTo('Goodbye beautiful world!');
        (0, test_bench_1.expectTemplate)('Goodbye {{"foo\'bar"}} world!')
            .withInput({ "foo'bar": 'beautiful' })
            .toCompileTo('Goodbye beautiful world!');
        (0, test_bench_1.expectTemplate)("Goodbye {{'foo\"bar'}} world!")
            .withInput({ 'foo"bar': 'beautiful' })
            .toCompileTo('Goodbye beautiful world!');
    });
    it("that current context path ({{.}}) doesn't hit helpers", () => {
        (0, test_bench_1.expectTemplate)('test: {{.}}')
            .withInput(null)
            // @ts-expect-error Setting the helper to a string instead of a function doesn't make sense normally, but here it doesn't matter
            .withHelpers({ helper: 'awesome' })
            .toCompileTo('test: ');
    });
    it('complex but empty paths', () => {
        (0, test_bench_1.expectTemplate)('{{person/name}}')
            .withInput({ person: { name: null } })
            .toCompileTo('');
        (0, test_bench_1.expectTemplate)('{{person/name}}').withInput({ person: {} }).toCompileTo('');
    });
    it('this keyword in paths', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{this}}{{/goodbyes}}')
            .withInput({ goodbyes: ['goodbye', 'Goodbye', 'GOODBYE'] })
            .toCompileTo('goodbyeGoodbyeGOODBYE');
        (0, test_bench_1.expectTemplate)('{{#hellos}}{{this/text}}{{/hellos}}')
            .withInput({
            hellos: [{ text: 'hello' }, { text: 'Hello' }, { text: 'HELLO' }],
        })
            .toCompileTo('helloHelloHELLO');
    });
    it('this keyword nested inside path', () => {
        (0, test_bench_1.expectTemplate)('{{#hellos}}{{text/this/foo}}{{/hellos}}').toThrow('Invalid path: text/this - 1:13');
        (0, test_bench_1.expectTemplate)('{{[this]}}').withInput({ this: 'bar' }).toCompileTo('bar');
        (0, test_bench_1.expectTemplate)('{{text/[this]}}')
            .withInput({ text: { this: 'bar' } })
            .toCompileTo('bar');
    });
    it('this keyword in helpers', () => {
        const helpers = {
            foo(value) {
                return 'bar ' + value;
            },
        };
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{foo this}}{{/goodbyes}}')
            .withInput({ goodbyes: ['goodbye', 'Goodbye', 'GOODBYE'] })
            .withHelpers(helpers)
            .toCompileTo('bar goodbyebar Goodbyebar GOODBYE');
        (0, test_bench_1.expectTemplate)('{{#hellos}}{{foo this/text}}{{/hellos}}')
            .withInput({
            hellos: [{ text: 'hello' }, { text: 'Hello' }, { text: 'HELLO' }],
        })
            .withHelpers(helpers)
            .toCompileTo('bar hellobar Hellobar HELLO');
    });
    it('this keyword nested inside helpers param', () => {
        (0, test_bench_1.expectTemplate)('{{#hellos}}{{foo text/this/foo}}{{/hellos}}').toThrow('Invalid path: text/this - 1:17');
        (0, test_bench_1.expectTemplate)('{{foo [this]}}')
            .withInput({
            foo(value) {
                return value;
            },
            this: 'bar',
        })
            .toCompileTo('bar');
        (0, test_bench_1.expectTemplate)('{{foo text/[this]}}')
            .withInput({
            foo(value) {
                return value;
            },
            text: { this: 'bar' },
        })
            .toCompileTo('bar');
    });
    it('pass string literals', () => {
        (0, test_bench_1.expectTemplate)('{{"foo"}}').toCompileTo('');
        (0, test_bench_1.expectTemplate)('{{"foo"}}').withInput({ foo: 'bar' }).toCompileTo('bar');
        (0, test_bench_1.expectTemplate)('{{#"foo"}}{{.}}{{/"foo"}}')
            .withInput({
            foo: ['bar', 'baz'],
        })
            .toCompileTo('barbaz');
    });
    it('pass number literals', () => {
        (0, test_bench_1.expectTemplate)('{{12}}').toCompileTo('');
        (0, test_bench_1.expectTemplate)('{{12}}').withInput({ '12': 'bar' }).toCompileTo('bar');
        (0, test_bench_1.expectTemplate)('{{12.34}}').toCompileTo('');
        (0, test_bench_1.expectTemplate)('{{12.34}}').withInput({ '12.34': 'bar' }).toCompileTo('bar');
        (0, test_bench_1.expectTemplate)('{{12.34 1}}')
            .withInput({
            '12.34'(arg) {
                return 'bar' + arg;
            },
        })
            .toCompileTo('bar1');
    });
    it('pass boolean literals', () => {
        (0, test_bench_1.expectTemplate)('{{true}}').toCompileTo('');
        (0, test_bench_1.expectTemplate)('{{true}}').withInput({ '': 'foo' }).toCompileTo('');
        (0, test_bench_1.expectTemplate)('{{false}}').withInput({ false: 'foo' }).toCompileTo('foo');
    });
    it('should handle literals in subexpression', () => {
        (0, test_bench_1.expectTemplate)('{{foo (false)}}')
            .withInput({
            false() {
                return 'bar';
            },
        })
            .withHelper('foo', function (arg) {
            return arg;
        })
            .toCompileTo('bar');
    });
});
