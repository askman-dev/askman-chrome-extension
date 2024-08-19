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
describe('Regressions', () => {
    it('GH-94: Cannot read property of undefined', () => {
        (0, test_bench_1.expectTemplate)('{{#books}}{{title}}{{author.name}}{{/books}}')
            .withInput({
            books: [
                {
                    title: 'The origin of species',
                    author: {
                        name: 'Charles Darwin',
                    },
                },
                {
                    title: 'Lazarillo de Tormes',
                },
            ],
        })
            .toCompileTo('The origin of speciesCharles DarwinLazarillo de Tormes');
    });
    it("GH-150: Inverted sections print when they shouldn't", () => {
        const string = '{{^set}}not set{{/set}} :: {{#set}}set{{/set}}';
        (0, test_bench_1.expectTemplate)(string).toCompileTo('not set :: ');
        (0, test_bench_1.expectTemplate)(string).withInput({ set: undefined }).toCompileTo('not set :: ');
        (0, test_bench_1.expectTemplate)(string).withInput({ set: false }).toCompileTo('not set :: ');
        (0, test_bench_1.expectTemplate)(string).withInput({ set: true }).toCompileTo(' :: set');
    });
    it('GH-158: Using array index twice, breaks the template', () => {
        (0, test_bench_1.expectTemplate)('{{arr.[0]}}, {{arr.[1]}}')
            .withInput({ arr: [1, 2] })
            .toCompileTo('1, 2');
    });
    it("bug reported by @fat where lambdas weren't being properly resolved", () => {
        const string = '<strong>This is a slightly more complicated {{thing}}.</strong>.\n' +
            '{{! Just ignore this business. }}\n' +
            'Check this out:\n' +
            '{{#hasThings}}\n' +
            '<ul>\n' +
            '{{#things}}\n' +
            '<li class={{className}}>{{word}}</li>\n' +
            '{{/things}}</ul>.\n' +
            '{{/hasThings}}\n' +
            '{{^hasThings}}\n' +
            '\n' +
            '<small>Nothing to check out...</small>\n' +
            '{{/hasThings}}';
        const data = {
            thing() {
                return 'blah';
            },
            things: [
                { className: 'one', word: '@fat' },
                { className: 'two', word: '@dhg' },
                { className: 'three', word: '@sayrer' },
            ],
            hasThings() {
                return true;
            },
        };
        const output = '<strong>This is a slightly more complicated blah.</strong>.\n' +
            'Check this out:\n' +
            '<ul>\n' +
            '<li class=one>@fat</li>\n' +
            '<li class=two>@dhg</li>\n' +
            '<li class=three>@sayrer</li>\n' +
            '</ul>.\n';
        (0, test_bench_1.expectTemplate)(string).withInput(data).toCompileTo(output);
    });
    it('GH-408: Multiple loops fail', () => {
        (0, test_bench_1.expectTemplate)('{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}{{#.}}{{name}}{{/.}}')
            .withInput([
            { name: 'John Doe', location: { city: 'Chicago' } },
            { name: 'Jane Doe', location: { city: 'New York' } },
        ])
            .toCompileTo('John DoeJane DoeJohn DoeJane DoeJohn DoeJane Doe');
    });
    it('GS-428: Nested if else rendering', () => {
        const succeedingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}}  {{#blk}} Expected {{/blk}} {{/inverse}}';
        const failingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}} {{#blk}} Expected {{/blk}} {{/inverse}}';
        const helpers = {
            blk(block) {
                return block.fn('');
            },
            inverse(block) {
                return block.inverse('');
            },
        };
        (0, test_bench_1.expectTemplate)(succeedingTemplate).withHelpers(helpers).toCompileTo('   Expected  ');
        (0, test_bench_1.expectTemplate)(failingTemplate).withHelpers(helpers).toCompileTo('  Expected  ');
    });
    it('GH-458: Scoped this identifier', () => {
        (0, test_bench_1.expectTemplate)('{{./foo}}').withInput({ foo: 'bar' }).toCompileTo('bar');
    });
    it('GH-375: Unicode line terminators', () => {
        (0, test_bench_1.expectTemplate)('\u2028').toCompileTo('\u2028');
    });
    it('GH-534: Object prototype aliases', () => {
        /* eslint-disable no-extend-native */
        // @ts-expect-error
        Object.prototype[0xd834] = true;
        (0, test_bench_1.expectTemplate)('{{foo}}').withInput({ foo: 'bar' }).toCompileTo('bar');
        // @ts-expect-error
        delete Object.prototype[0xd834];
        /* eslint-enable no-extend-native */
    });
    it('GH-437: Matching escaping', () => {
        (0, test_bench_1.expectTemplate)('{{{a}}').toThrow(/Parse error on/);
        (0, test_bench_1.expectTemplate)('{{a}}}').toThrow(/Parse error on/);
    });
    it('GH-676: Using array in escaping mustache fails', () => {
        const data = { arr: [1, 2] };
        (0, test_bench_1.expectTemplate)('{{arr}}').withInput(data).toCompileTo(data.arr.toString());
    });
    it('Mustache man page', () => {
        (0, test_bench_1.expectTemplate)('Hello {{name}}. You have just won ${{value}}!{{#in_ca}} Well, ${{taxed_value}}, after taxes.{{/in_ca}}')
            .withInput({
            name: 'Chris',
            value: 10000,
            taxed_value: 10000 - 10000 * 0.4,
            in_ca: true,
        })
            .toCompileTo('Hello Chris. You have just won $10000! Well, $6000, after taxes.');
    });
    it('GH-731: zero context rendering', () => {
        (0, test_bench_1.expectTemplate)('{{#foo}} This is {{bar}} ~ {{/foo}}')
            .withInput({
            foo: 0,
            bar: 'OK',
        })
            .toCompileTo(' This is  ~ ');
    });
    it('GH-820: zero pathed rendering', () => {
        (0, test_bench_1.expectTemplate)('{{foo.bar}}').withInput({ foo: 0 }).toCompileTo('');
    });
    it('GH-837: undefined values for helpers', () => {
        (0, test_bench_1.expectTemplate)('{{str bar.baz}}')
            .withHelpers({
            str(value) {
                return value + '';
            },
        })
            .toCompileTo('undefined');
    });
    it('GH-926: Depths and de-dupe', () => {
        (0, test_bench_1.expectTemplate)('{{#if dater}}{{#each data}}{{../name}}{{/each}}{{else}}{{#each notData}}{{../name}}{{/each}}{{/if}}')
            .withInput({
            name: 'foo',
            data: [1],
            notData: [1],
        })
            .toCompileTo('foo');
    });
    it('GH-1021: Each empty string key', () => {
        (0, test_bench_1.expectTemplate)('{{#each data}}Key: {{@key}}\n{{/each}}')
            .withInput({
            data: {
                '': 'foo',
                name: 'Chris',
                value: 10000,
            },
        })
            .toCompileTo('Key: \nKey: name\nKey: value\n');
    });
    it('GH-1054: Should handle simple safe string responses', () => {
        (0, test_bench_1.expectTemplate)('{{#wrap}}{{>partial}}{{/wrap}}')
            .withHelpers({
            wrap(options) {
                return new __1.default.SafeString(options.fn());
            },
        })
            .withPartials({
            partial: '{{#wrap}}<partial>{{/wrap}}',
        })
            .toCompileTo('<partial>');
    });
    it('GH-1065: Sparse arrays', () => {
        const array = [];
        array[1] = 'foo';
        array[3] = 'bar';
        (0, test_bench_1.expectTemplate)('{{#each array}}{{@index}}{{.}}{{/each}}')
            .withInput({ array })
            .toCompileTo('1foo3bar');
    });
    it('GH-1093: Undefined helper context', () => {
        (0, test_bench_1.expectTemplate)('{{#each obj}}{{{helper}}}{{.}}{{/each}}')
            .withInput({ obj: { foo: undefined, bar: 'bat' } })
            .withHelpers({
            helper() {
                // It's valid to execute a block against an undefined context, but
                // helpers can not do so, so we expect to have an empty object here;
                for (const name in this) {
                    if (Object.prototype.hasOwnProperty.call(this, name)) {
                        return 'found';
                    }
                }
                // And to make IE happy, check for the known string as length is not enumerated.
                return this === 'bat' ? 'found' : 'not';
            },
        })
            .toCompileTo('notfoundbat');
    });
    it('should support multiple levels of inline partials', () => {
        (0, test_bench_1.expectTemplate)('{{#> layout}}{{#*inline "subcontent"}}subcontent{{/inline}}{{/layout}}')
            .withPartials({
            doctype: 'doctype{{> content}}',
            layout: '{{#> doctype}}{{#*inline "content"}}layout{{> subcontent}}{{/inline}}{{/doctype}}',
        })
            .toCompileTo('doctypelayoutsubcontent');
    });
    it('GH-1089: should support failover content in multiple levels of inline partials', () => {
        (0, test_bench_1.expectTemplate)('{{#> layout}}{{/layout}}')
            .withPartials({
            doctype: 'doctype{{> content}}',
            layout: '{{#> doctype}}{{#*inline "content"}}layout{{#> subcontent}}subcontent{{/subcontent}}{{/inline}}{{/doctype}}',
        })
            .toCompileTo('doctypelayoutsubcontent');
    });
    it('GH-1099: should support greater than 3 nested levels of inline partials', () => {
        (0, test_bench_1.expectTemplate)('{{#> layout}}Outer{{/layout}}')
            .withPartials({
            layout: '{{#> inner}}Inner{{/inner}}{{> @partial-block }}',
            inner: '',
        })
            .toCompileTo('Outer');
    });
    it('GH-1135 : Context handling within each iteration', () => {
        (0, test_bench_1.expectTemplate)('{{#each array}}\n' +
            ' 1. IF: {{#if true}}{{../name}}-{{../../name}}-{{../../../name}}{{/if}}\n' +
            ' 2. MYIF: {{#myif true}}{{../name}}={{../../name}}={{../../../name}}{{/myif}}\n' +
            '{{/each}}')
            .withInput({ array: [1], name: 'John' })
            .withHelpers({
            myif(conditional, options) {
                if (conditional) {
                    return options.fn(this);
                }
                else {
                    return options.inverse(this);
                }
            },
        })
            .toCompileTo(' 1. IF: John--\n' + ' 2. MYIF: John==\n');
    });
    it('GH-1186: Support block params for existing programs', () => {
        (0, test_bench_1.expectTemplate)('{{#*inline "test"}}{{> @partial-block }}{{/inline}}' +
            '{{#>test }}{{#each listOne as |item|}}{{ item }}{{/each}}{{/test}}' +
            '{{#>test }}{{#each listTwo as |item|}}{{ item }}{{/each}}{{/test}}')
            .withInput({
            listOne: ['a'],
            listTwo: ['b'],
        })
            .toCompileTo('ab');
    });
    it('GH-1319: "unless" breaks when "each" value equals "null"', () => {
        (0, test_bench_1.expectTemplate)('{{#each list}}{{#unless ./prop}}parent={{../value}} {{/unless}}{{/each}}')
            .withInput({
            value: 'parent',
            list: [null, 'a'],
        })
            .toCompileTo('parent=parent parent=parent ');
    });
    it('GH-1341: 4.0.7 release breaks {{#if @partial-block}} usage', () => {
        (0, test_bench_1.expectTemplate)('template {{>partial}} template')
            .withPartials({
            partialWithBlock: '{{#if @partial-block}} block {{> @partial-block}} block {{/if}}',
            partial: '{{#> partialWithBlock}} partial {{/partialWithBlock}}',
        })
            .toCompileTo('template  block  partial  block  template');
    });
    it('should allow hash with protected array names', () => {
        (0, test_bench_1.expectTemplate)('{{helpa length="foo"}}')
            .withInput({ array: [1], name: 'John' })
            .withHelpers({
            helpa(options) {
                return options.hash.length;
            },
        })
            .toCompileTo('foo');
    });
    describe('GH-1598: Performance degradation for partials since v4.3.0', () => {
        let newHandlebarsInstance;
        let spy;
        beforeEach(() => {
            newHandlebarsInstance = __1.default.create();
        });
        afterEach(() => {
            spy.mockRestore();
        });
        (0, test_bench_1.forEachCompileFunctionName)((compileName) => {
            it(`should only compile global partials once when calling #${compileName}`, () => {
                const compile = newHandlebarsInstance[compileName].bind(newHandlebarsInstance);
                let calls;
                switch (compileName) {
                    case 'compile':
                        spy = jest.spyOn(newHandlebarsInstance, 'template');
                        calls = 3;
                        break;
                    case 'compileAST':
                        spy = jest.spyOn(newHandlebarsInstance, 'compileAST');
                        calls = 2;
                        break;
                }
                newHandlebarsInstance.registerPartial({
                    dude: 'I am a partial',
                });
                const string = 'Dudes: {{> dude}} {{> dude}}';
                compile(string)(); // This should compile template + partial once
                compile(string)(); // This should only compile template
                expect(spy).toHaveBeenCalledTimes(calls);
                spy.mockRestore();
            });
        });
    });
    describe("GH-1639: TypeError: Cannot read property 'apply' of undefined\" when handlebars version > 4.6.0 (undocumented, deprecated usage)", () => {
        it('should treat undefined helpers like non-existing helpers', () => {
            (0, test_bench_1.expectTemplate)('{{foo}}')
                .withHelper('foo', undefined)
                .withInput({ foo: 'bar' })
                .toCompileTo('bar');
        });
    });
});
