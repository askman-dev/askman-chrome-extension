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
describe('partials', () => {
    it('basic partials', () => {
        const string = 'Dudes: {{#dudes}}{{> dude}}{{/dudes}}';
        const partial = '{{name}} ({{url}}) ';
        const hash = {
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        };
        (0, test_bench_1.expectTemplate)(string)
            .withInput(hash)
            .withPartials({ dude: partial })
            .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
        (0, test_bench_1.expectTemplate)(string)
            .withInput(hash)
            .withPartials({ dude: partial })
            .withRuntimeOptions({ data: false })
            .withCompileOptions({ data: false })
            .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
    });
    it('dynamic partials', () => {
        const string = 'Dudes: {{#dudes}}{{> (partial)}}{{/dudes}}';
        const partial = '{{name}} ({{url}}) ';
        const hash = {
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        };
        const helpers = {
            partial: () => 'dude',
        };
        (0, test_bench_1.expectTemplate)(string)
            .withInput(hash)
            .withHelpers(helpers)
            .withPartials({ dude: partial })
            .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
        (0, test_bench_1.expectTemplate)(string)
            .withInput(hash)
            .withHelpers(helpers)
            .withPartials({ dude: partial })
            .withRuntimeOptions({ data: false })
            .withCompileOptions({ data: false })
            .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
    });
    it('failing dynamic partials', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{#dudes}}{{> (partial)}}{{/dudes}}')
            .withInput({
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        })
            .withHelper('partial', () => 'missing')
            .withPartial('dude', '{{name}} ({{url}}) ')
            .toThrow('The partial missing could not be found'); // TODO: Is there a way we can test that the error is of type `Handlebars.Exception`?
    });
    it('partials with context', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{>dude dudes}}')
            .withInput({
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        })
            .withPartial('dude', '{{#this}}{{name}} ({{url}}) {{/this}}')
            .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
    });
    it('partials with no context', () => {
        const partial = '{{name}} ({{url}}) ';
        const hash = {
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        };
        (0, test_bench_1.expectTemplate)('Dudes: {{#dudes}}{{>dude}}{{/dudes}}')
            .withInput(hash)
            .withPartial('dude', partial)
            .withCompileOptions({ explicitPartialContext: true })
            .toCompileTo('Dudes:  ()  () ');
        (0, test_bench_1.expectTemplate)('Dudes: {{#dudes}}{{>dude name="foo"}}{{/dudes}}')
            .withInput(hash)
            .withPartial('dude', partial)
            .withCompileOptions({ explicitPartialContext: true })
            .toCompileTo('Dudes: foo () foo () ');
    });
    it('partials with string context', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{>dude "dudes"}}')
            .withPartial('dude', '{{.}}')
            .toCompileTo('Dudes: dudes');
    });
    it('partials with undefined context', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{>dude dudes}}')
            .withPartial('dude', '{{foo}} Empty')
            .toCompileTo('Dudes:  Empty');
    });
    it('partials with duplicate parameters', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{>dude dudes foo bar=baz}}').toThrow('Unsupported number of partial arguments: 2 - 1:7');
    });
    it('partials with parameters', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{#dudes}}{{> dude others=..}}{{/dudes}}')
            .withInput({
            foo: 'bar',
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        })
            .withPartial('dude', '{{others.foo}}{{name}} ({{url}}) ')
            .toCompileTo('Dudes: barYehuda (http://yehuda) barAlan (http://alan) ');
    });
    it('partial in a partial', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{#dudes}}{{>dude}}{{/dudes}}')
            .withInput({
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        })
            .withPartials({
            dude: '{{name}} {{> url}} ',
            url: '<a href="{{url}}">{{url}}</a>',
        })
            .toCompileTo('Dudes: Yehuda <a href="http://yehuda">http://yehuda</a> Alan <a href="http://alan">http://alan</a> ');
    });
    it('rendering undefined partial throws an exception', () => {
        (0, test_bench_1.expectTemplate)('{{> whatever}}').toThrow('The partial whatever could not be found');
    });
    it('registering undefined partial throws an exception', () => {
        global.kbnHandlebarsEnv = __1.default.create();
        expect(() => {
            kbnHandlebarsEnv.registerPartial('undefined_test', undefined);
        }).toThrow('Attempting to register a partial called "undefined_test" as undefined');
        global.kbnHandlebarsEnv = null;
    });
    it('rendering template partial in vm mode throws an exception', () => {
        (0, test_bench_1.expectTemplate)('{{> whatever}}').toThrow('The partial whatever could not be found');
    });
    it('rendering function partial in vm mode', () => {
        function partial(context) {
            return context.name + ' (' + context.url + ') ';
        }
        (0, test_bench_1.expectTemplate)('Dudes: {{#dudes}}{{> dude}}{{/dudes}}')
            .withInput({
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        })
            .withPartial('dude', partial)
            .toCompileTo('Dudes: Yehuda (http://yehuda) Alan (http://alan) ');
    });
    it('GH-14: a partial preceding a selector', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{>dude}} {{anotherDude}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('dude', '{{name}}')
            .toCompileTo('Dudes: Jeepers Creepers');
    });
    it('Partials with slash paths', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{> shared/dude}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('shared/dude', '{{name}}')
            .toCompileTo('Dudes: Jeepers');
    });
    it('Partials with slash and point paths', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{> shared/dude.thing}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('shared/dude.thing', '{{name}}')
            .toCompileTo('Dudes: Jeepers');
    });
    it('Global Partials', () => {
        global.kbnHandlebarsEnv = __1.default.create();
        kbnHandlebarsEnv.registerPartial('globalTest', '{{anotherDude}}');
        (0, test_bench_1.expectTemplate)('Dudes: {{> shared/dude}} {{> globalTest}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('shared/dude', '{{name}}')
            .toCompileTo('Dudes: Jeepers Creepers');
        kbnHandlebarsEnv.unregisterPartial('globalTest');
        expect(kbnHandlebarsEnv.partials.globalTest).toBeUndefined();
        global.kbnHandlebarsEnv = null;
    });
    it('Multiple partial registration', () => {
        global.kbnHandlebarsEnv = __1.default.create();
        kbnHandlebarsEnv.registerPartial({
            'shared/dude': '{{name}}',
            globalTest: '{{anotherDude}}',
        });
        (0, test_bench_1.expectTemplate)('Dudes: {{> shared/dude}} {{> globalTest}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('notused', 'notused') // trick the test bench into running with partials enabled
            .toCompileTo('Dudes: Jeepers Creepers');
        global.kbnHandlebarsEnv = null;
    });
    it('Partials with integer path', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{> 404}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial(404, '{{name}}')
            .toCompileTo('Dudes: Jeepers');
    });
    it('Partials with complex path', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{> 404/asdf?.bar}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('404/asdf?.bar', '{{name}}')
            .toCompileTo('Dudes: Jeepers');
    });
    it('Partials with escaped', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{> [+404/asdf?.bar]}}')
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('+404/asdf?.bar', '{{name}}')
            .toCompileTo('Dudes: Jeepers');
    });
    it('Partials with string', () => {
        (0, test_bench_1.expectTemplate)("Dudes: {{> '+404/asdf?.bar'}}")
            .withInput({ name: 'Jeepers', anotherDude: 'Creepers' })
            .withPartial('+404/asdf?.bar', '{{name}}')
            .toCompileTo('Dudes: Jeepers');
    });
    it('should handle empty partial', () => {
        (0, test_bench_1.expectTemplate)('Dudes: {{#dudes}}{{> dude}}{{/dudes}}')
            .withInput({
            dudes: [
                { name: 'Yehuda', url: 'http://yehuda' },
                { name: 'Alan', url: 'http://alan' },
            ],
        })
            .withPartial('dude', '')
            .toCompileTo('Dudes: ');
    });
    // Skipping test as this only makes sense when there's no `compile` function (i.e. runtime-only mode).
    // We do not support that mode with `@kbn/handlebars`, so there's no need to test it
    it.skip('throw on missing partial', () => {
        const handlebars = __1.default.create();
        handlebars.compile = undefined;
        const template = handlebars.precompile('{{> dude}}');
        const render = handlebars.template(eval('(' + template + ')')); // eslint-disable-line no-eval
        expect(() => {
            render({}, {
                partials: {
                    dude: 'fail',
                },
            });
        }).toThrow(/The partial dude could not be compiled/);
    });
    describe('partial blocks', () => {
        it('should render partial block as default', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}success{{/dude}}').toCompileTo('success');
        });
        it('should execute default block with proper context', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude context}}{{value}}{{/dude}}')
                .withInput({ context: { value: 'success' } })
                .toCompileTo('success');
        });
        it('should propagate block parameters to default block', () => {
            (0, test_bench_1.expectTemplate)('{{#with context as |me|}}{{#> dude}}{{me.value}}{{/dude}}{{/with}}')
                .withInput({ context: { value: 'success' } })
                .toCompileTo('success');
        });
        it('should not use partial block if partial exists', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}fail{{/dude}}')
                .withPartials({ dude: 'success' })
                .toCompileTo('success');
        });
        it('should render block from partial', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}success{{/dude}}')
                .withPartials({ dude: '{{> @partial-block }}' })
                .toCompileTo('success');
        });
        it('should be able to render the partial-block twice', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}success{{/dude}}')
                .withPartials({ dude: '{{> @partial-block }} {{> @partial-block }}' })
                .toCompileTo('success success');
        });
        it('should render block from partial with context', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}{{value}}{{/dude}}')
                .withInput({ context: { value: 'success' } })
                .withPartials({
                dude: '{{#with context}}{{> @partial-block }}{{/with}}',
            })
                .toCompileTo('success');
        });
        it('should be able to access the @data frame from a partial-block', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}in-block: {{@root/value}}{{/dude}}')
                .withInput({ value: 'success' })
                .withPartials({
                dude: '<code>before-block: {{@root/value}} {{>   @partial-block }}</code>',
            })
                .toCompileTo('<code>before-block: success in-block: success</code>');
        });
        it('should allow the #each-helper to be used along with partial-blocks', () => {
            (0, test_bench_1.expectTemplate)('<template>{{#> list value}}value = {{.}}{{/list}}</template>')
                .withInput({
                value: ['a', 'b', 'c'],
            })
                .withPartials({
                list: '<list>{{#each .}}<item>{{> @partial-block}}</item>{{/each}}</list>',
            })
                .toCompileTo('<template><list><item>value = a</item><item>value = b</item><item>value = c</item></list></template>');
        });
        it('should render block from partial with context (twice)', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}{{value}}{{/dude}}')
                .withInput({ context: { value: 'success' } })
                .withPartials({
                dude: '{{#with context}}{{> @partial-block }} {{> @partial-block }}{{/with}}',
            })
                .toCompileTo('success success');
        });
        it('should render block from partial with context [2]', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}{{../context/value}}{{/dude}}')
                .withInput({ context: { value: 'success' } })
                .withPartials({
                dude: '{{#with context}}{{> @partial-block }}{{/with}}',
            })
                .toCompileTo('success');
        });
        it('should render block from partial with block params', () => {
            (0, test_bench_1.expectTemplate)('{{#with context as |me|}}{{#> dude}}{{me.value}}{{/dude}}{{/with}}')
                .withInput({ context: { value: 'success' } })
                .withPartials({ dude: '{{> @partial-block }}' })
                .toCompileTo('success');
        });
        it('should render nested partial blocks', () => {
            (0, test_bench_1.expectTemplate)('<template>{{#> outer}}{{value}}{{/outer}}</template>')
                .withInput({ value: 'success' })
                .withPartials({
                outer: '<outer>{{#> nested}}<outer-block>{{> @partial-block}}</outer-block>{{/nested}}</outer>',
                nested: '<nested>{{> @partial-block}}</nested>',
            })
                .toCompileTo('<template><outer><nested><outer-block>success</outer-block></nested></outer></template>');
        });
        it('should render nested partial blocks at different nesting levels', () => {
            (0, test_bench_1.expectTemplate)('<template>{{#> outer}}{{value}}{{/outer}}</template>')
                .withInput({ value: 'success' })
                .withPartials({
                outer: '<outer>{{#> nested}}<outer-block>{{> @partial-block}}</outer-block>{{/nested}}{{> @partial-block}}</outer>',
                nested: '<nested>{{> @partial-block}}</nested>',
            })
                .toCompileTo('<template><outer><nested><outer-block>success</outer-block></nested>success</outer></template>');
        });
        it('should render nested partial blocks at different nesting levels (twice)', () => {
            (0, test_bench_1.expectTemplate)('<template>{{#> outer}}{{value}}{{/outer}}</template>')
                .withInput({ value: 'success' })
                .withPartials({
                outer: '<outer>{{#> nested}}<outer-block>{{> @partial-block}} {{> @partial-block}}</outer-block>{{/nested}}{{> @partial-block}}+{{> @partial-block}}</outer>',
                nested: '<nested>{{> @partial-block}}</nested>',
            })
                .toCompileTo('<template><outer><nested><outer-block>success success</outer-block></nested>success+success</outer></template>');
        });
        it('should render nested partial blocks (twice at each level)', () => {
            (0, test_bench_1.expectTemplate)('<template>{{#> outer}}{{value}}{{/outer}}</template>')
                .withInput({ value: 'success' })
                .withPartials({
                outer: '<outer>{{#> nested}}<outer-block>{{> @partial-block}} {{> @partial-block}}</outer-block>{{/nested}}</outer>',
                nested: '<nested>{{> @partial-block}}{{> @partial-block}}</nested>',
            })
                .toCompileTo('<template><outer>' +
                '<nested><outer-block>success success</outer-block><outer-block>success success</outer-block></nested>' +
                '</outer></template>');
        });
    });
    describe('inline partials', () => {
        it('should define inline partials for template', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}').toCompileTo('success');
        });
        it('should overwrite multiple partials in the same template', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "myPartial"}}fail{{/inline}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}').toCompileTo('success');
        });
        it('should define inline partials for block', () => {
            (0, test_bench_1.expectTemplate)('{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}{{/with}}').toCompileTo('success');
            (0, test_bench_1.expectTemplate)('{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{/with}}{{> myPartial}}').toThrow(/myPartial could not/);
        });
        it('should override global partials', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}')
                .withPartials({
                myPartial: () => 'fail',
            })
                .toCompileTo('success');
        });
        it('should override template partials', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "myPartial"}}fail{{/inline}}{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{> myPartial}}{{/with}}').toCompileTo('success');
        });
        it('should override partials down the entire stack', () => {
            (0, test_bench_1.expectTemplate)('{{#with .}}{{#*inline "myPartial"}}success{{/inline}}{{#with .}}{{#with .}}{{> myPartial}}{{/with}}{{/with}}{{/with}}').toCompileTo('success');
        });
        it('should define inline partials for partial call', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "myPartial"}}success{{/inline}}{{> dude}}')
                .withPartials({ dude: '{{> myPartial }}' })
                .toCompileTo('success');
        });
        it('should define inline partials in partial block call', () => {
            (0, test_bench_1.expectTemplate)('{{#> dude}}{{#*inline "myPartial"}}success{{/inline}}{{/dude}}')
                .withPartials({ dude: '{{> myPartial }}' })
                .toCompileTo('success');
        });
        it('should render nested inline partials', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "outer"}}{{#>inner}}<outer-block>{{>@partial-block}}</outer-block>{{/inner}}{{/inline}}' +
                '{{#*inline "inner"}}<inner>{{>@partial-block}}</inner>{{/inline}}' +
                '{{#>outer}}{{value}}{{/outer}}')
                .withInput({ value: 'success' })
                .toCompileTo('<inner><outer-block>success</outer-block></inner>');
        });
        it('should render nested inline partials with partial-blocks on different nesting levels', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "outer"}}{{#>inner}}<outer-block>{{>@partial-block}}</outer-block>{{/inner}}{{>@partial-block}}{{/inline}}' +
                '{{#*inline "inner"}}<inner>{{>@partial-block}}</inner>{{/inline}}' +
                '{{#>outer}}{{value}}{{/outer}}')
                .withInput({ value: 'success' })
                .toCompileTo('<inner><outer-block>success</outer-block></inner>success');
        });
        it('should render nested inline partials (twice at each level)', () => {
            (0, test_bench_1.expectTemplate)('{{#*inline "outer"}}{{#>inner}}<outer-block>{{>@partial-block}} {{>@partial-block}}</outer-block>{{/inner}}{{/inline}}' +
                '{{#*inline "inner"}}<inner>{{>@partial-block}}{{>@partial-block}}</inner>{{/inline}}' +
                '{{#>outer}}{{value}}{{/outer}}')
                .withInput({ value: 'success' })
                .toCompileTo('<inner><outer-block>success success</outer-block><outer-block>success success</outer-block></inner>');
        });
    });
    (0, test_bench_1.forEachCompileFunctionName)((compileName) => {
        it(`should pass compiler flags for ${compileName} function`, () => {
            const env = __1.default.create();
            env.registerPartial('partial', '{{foo}}');
            const compile = env[compileName].bind(env);
            const template = compile('{{foo}} {{> partial}}', { noEscape: true });
            expect(template({ foo: '<' })).toEqual('< <');
        });
    });
    describe('standalone partials', () => {
        it('indented partials', () => {
            (0, test_bench_1.expectTemplate)('Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}')
                .withInput({
                dudes: [
                    { name: 'Yehuda', url: 'http://yehuda' },
                    { name: 'Alan', url: 'http://alan' },
                ],
            })
                .withPartial('dude', '{{name}}\n')
                .toCompileTo('Dudes:\n  Yehuda\n  Alan\n');
        });
        it('nested indented partials', () => {
            (0, test_bench_1.expectTemplate)('Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}')
                .withInput({
                dudes: [
                    { name: 'Yehuda', url: 'http://yehuda' },
                    { name: 'Alan', url: 'http://alan' },
                ],
            })
                .withPartials({
                dude: '{{name}}\n {{> url}}',
                url: '{{url}}!\n',
            })
                .toCompileTo('Dudes:\n  Yehuda\n   http://yehuda!\n  Alan\n   http://alan!\n');
        });
        it('prevent nested indented partials', () => {
            (0, test_bench_1.expectTemplate)('Dudes:\n{{#dudes}}\n  {{>dude}}\n{{/dudes}}')
                .withInput({
                dudes: [
                    { name: 'Yehuda', url: 'http://yehuda' },
                    { name: 'Alan', url: 'http://alan' },
                ],
            })
                .withPartials({
                dude: '{{name}}\n {{> url}}',
                url: '{{url}}!\n',
            })
                .withCompileOptions({ preventIndent: true })
                .toCompileTo('Dudes:\n  Yehuda\n http://yehuda!\n  Alan\n http://alan!\n');
        });
    });
});
