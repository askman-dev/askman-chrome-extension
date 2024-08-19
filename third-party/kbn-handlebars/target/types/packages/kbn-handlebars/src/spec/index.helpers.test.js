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
beforeEach(() => {
    global.kbnHandlebarsEnv = __1.default.create();
});
afterEach(() => {
    global.kbnHandlebarsEnv = null;
});
describe('helpers', () => {
    it('helper with complex lookup$', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{{link ../prefix}}}{{/goodbyes}}')
            .withInput({
            prefix: '/root',
            goodbyes: [{ text: 'Goodbye', url: 'goodbye' }],
        })
            .withHelper('link', function (prefix) {
            return '<a href="' + prefix + '/' + this.url + '">' + this.text + '</a>';
        })
            .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
    });
    it('helper for raw block gets raw content', () => {
        (0, test_bench_1.expectTemplate)('{{{{raw}}}} {{test}} {{{{/raw}}}}')
            .withInput({ test: 'hello' })
            .withHelper('raw', function (options) {
            return options.fn();
        })
            .toCompileTo(' {{test}} ');
    });
    it('helper for raw block gets parameters', () => {
        (0, test_bench_1.expectTemplate)('{{{{raw 1 2 3}}}} {{test}} {{{{/raw}}}}')
            .withInput({ test: 'hello' })
            .withHelper('raw', function (a, b, c, options) {
            const ret = options.fn() + a + b + c;
            return ret;
        })
            .toCompileTo(' {{test}} 123');
    });
    describe('raw block parsing (with identity helper-function)', () => {
        function runWithIdentityHelper(template, expected) {
            (0, test_bench_1.expectTemplate)(template)
                .withHelper('identity', function (options) {
                return options.fn();
            })
                .toCompileTo(expected);
        }
        it('helper for nested raw block gets raw content', () => {
            runWithIdentityHelper('{{{{identity}}}} {{{{b}}}} {{{{/b}}}} {{{{/identity}}}}', ' {{{{b}}}} {{{{/b}}}} ');
        });
        it('helper for nested raw block works with empty content', () => {
            runWithIdentityHelper('{{{{identity}}}}{{{{/identity}}}}', '');
        });
        it.skip('helper for nested raw block works if nested raw blocks are broken', () => {
            // This test was introduced in 4.4.4, but it was not the actual problem that lead to the patch release
            // The test is deactivated, because in 3.x this template cases an exception and it also does not work in 4.4.3
            // If anyone can make this template work without breaking everything else, then go for it,
            // but for now, this is just a known bug, that will be documented.
            runWithIdentityHelper('{{{{identity}}}} {{{{a}}}} {{{{ {{{{/ }}}} }}}} {{{{/identity}}}}', ' {{{{a}}}} {{{{ {{{{/ }}}} }}}} ');
        });
        it('helper for nested raw block closes after first matching close', () => {
            runWithIdentityHelper('{{{{identity}}}}abc{{{{/identity}}}} {{{{identity}}}}abc{{{{/identity}}}}', 'abc abc');
        });
        it('helper for nested raw block throw exception when with missing closing braces', () => {
            const string = '{{{{a}}}} {{{{/a';
            (0, test_bench_1.expectTemplate)(string).toThrow();
        });
    });
    it('helper block with identical context', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{name}}{{/goodbyes}}')
            .withInput({ name: 'Alan' })
            .withHelper('goodbyes', function (options) {
            let out = '';
            const byes = ['Goodbye', 'goodbye', 'GOODBYE'];
            for (let i = 0, j = byes.length; i < j; i++) {
                out += byes[i] + ' ' + options.fn(this) + '! ';
            }
            return out;
        })
            .toCompileTo('Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
    });
    it('helper block with complex lookup expression', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{../name}}{{/goodbyes}}')
            .withInput({ name: 'Alan' })
            .withHelper('goodbyes', function (options) {
            let out = '';
            const byes = ['Goodbye', 'goodbye', 'GOODBYE'];
            for (let i = 0, j = byes.length; i < j; i++) {
                out += byes[i] + ' ' + options.fn({}) + '! ';
            }
            return out;
        })
            .toCompileTo('Goodbye Alan! goodbye Alan! GOODBYE Alan! ');
    });
    it('helper with complex lookup and nested template', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}')
            .withInput({
            prefix: '/root',
            goodbyes: [{ text: 'Goodbye', url: 'goodbye' }],
        })
            .withHelper('link', function (prefix, options) {
            return '<a href="' + prefix + '/' + this.url + '">' + options.fn(this) + '</a>';
        })
            .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
    });
    it('helper with complex lookup and nested template in VM+Compiler', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{#link ../prefix}}{{text}}{{/link}}{{/goodbyes}}')
            .withInput({
            prefix: '/root',
            goodbyes: [{ text: 'Goodbye', url: 'goodbye' }],
        })
            .withHelper('link', function (prefix, options) {
            return '<a href="' + prefix + '/' + this.url + '">' + options.fn(this) + '</a>';
        })
            .toCompileTo('<a href="/root/goodbye">Goodbye</a>');
    });
    it('helper returning undefined value', () => {
        (0, test_bench_1.expectTemplate)(' {{nothere}}')
            .withHelpers({
            nothere() { },
        })
            .toCompileTo(' ');
        (0, test_bench_1.expectTemplate)(' {{#nothere}}{{/nothere}}')
            .withHelpers({
            nothere() { },
        })
            .toCompileTo(' ');
    });
    it('block helper', () => {
        (0, test_bench_1.expectTemplate)('{{#goodbyes}}{{text}}! {{/goodbyes}}cruel {{world}}!')
            .withInput({ world: 'world' })
            .withHelper('goodbyes', function (options) {
            return options.fn({ text: 'GOODBYE' });
        })
            .toCompileTo('GOODBYE! cruel world!');
    });
    it('block helper staying in the same context', () => {
        (0, test_bench_1.expectTemplate)('{{#form}}<p>{{name}}</p>{{/form}}')
            .withInput({ name: 'Yehuda' })
            .withHelper('form', function (options) {
            return '<form>' + options.fn(this) + '</form>';
        })
            .toCompileTo('<form><p>Yehuda</p></form>');
    });
    it('block helper should have context in this', () => {
        function link(options) {
            return '<a href="/people/' + this.id + '">' + options.fn(this) + '</a>';
        }
        (0, test_bench_1.expectTemplate)('<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>')
            .withInput({
            people: [
                { name: 'Alan', id: 1 },
                { name: 'Yehuda', id: 2 },
            ],
        })
            .withHelper('link', link)
            .toCompileTo('<ul><li><a href="/people/1">Alan</a></li><li><a href="/people/2">Yehuda</a></li></ul>');
    });
    it('block helper for undefined value', () => {
        (0, test_bench_1.expectTemplate)("{{#empty}}shouldn't render{{/empty}}").toCompileTo('');
    });
    it('block helper passing a new context', () => {
        (0, test_bench_1.expectTemplate)('{{#form yehuda}}<p>{{name}}</p>{{/form}}')
            .withInput({ yehuda: { name: 'Yehuda' } })
            .withHelper('form', function (context, options) {
            return '<form>' + options.fn(context) + '</form>';
        })
            .toCompileTo('<form><p>Yehuda</p></form>');
    });
    it('block helper passing a complex path context', () => {
        (0, test_bench_1.expectTemplate)('{{#form yehuda/cat}}<p>{{name}}</p>{{/form}}')
            .withInput({ yehuda: { name: 'Yehuda', cat: { name: 'Harold' } } })
            .withHelper('form', function (context, options) {
            return '<form>' + options.fn(context) + '</form>';
        })
            .toCompileTo('<form><p>Harold</p></form>');
    });
    it('nested block helpers', () => {
        (0, test_bench_1.expectTemplate)('{{#form yehuda}}<p>{{name}}</p>{{#link}}Hello{{/link}}{{/form}}')
            .withInput({
            yehuda: { name: 'Yehuda' },
        })
            .withHelper('link', function (options) {
            return '<a href="' + this.name + '">' + options.fn(this) + '</a>';
        })
            .withHelper('form', function (context, options) {
            return '<form>' + options.fn(context) + '</form>';
        })
            .toCompileTo('<form><p>Yehuda</p><a href="Yehuda">Hello</a></form>');
    });
    it('block helper inverted sections', () => {
        const string = "{{#list people}}{{name}}{{^}}<em>Nobody's here</em>{{/list}}";
        function list(context, options) {
            if (context.length > 0) {
                let out = '<ul>';
                for (let i = 0, j = context.length; i < j; i++) {
                    out += '<li>';
                    out += options.fn(context[i]);
                    out += '</li>';
                }
                out += '</ul>';
                return out;
            }
            else {
                return '<p>' + options.inverse(this) + '</p>';
            }
        }
        // the meaning here may be kind of hard to catch, but list.not is always called,
        // so we should see the output of both
        (0, test_bench_1.expectTemplate)(string)
            .withInput({ people: [{ name: 'Alan' }, { name: 'Yehuda' }] })
            .withHelpers({ list })
            .toCompileTo('<ul><li>Alan</li><li>Yehuda</li></ul>');
        (0, test_bench_1.expectTemplate)(string)
            .withInput({ people: [] })
            .withHelpers({ list })
            .toCompileTo("<p><em>Nobody's here</em></p>");
        (0, test_bench_1.expectTemplate)('{{#list people}}Hello{{^}}{{message}}{{/list}}')
            .withInput({
            people: [],
            message: "Nobody's here",
        })
            .withHelpers({ list })
            .toCompileTo('<p>Nobody&#x27;s here</p>');
    });
    it('pathed lambas with parameters', () => {
        const hash = {
            helper: () => 'winning',
        };
        // @ts-expect-error
        hash.hash = hash;
        const helpers = {
            './helper': () => 'fail',
        };
        (0, test_bench_1.expectTemplate)('{{./helper 1}}').withInput(hash).withHelpers(helpers).toCompileTo('winning');
        (0, test_bench_1.expectTemplate)('{{hash/helper 1}}').withInput(hash).withHelpers(helpers).toCompileTo('winning');
    });
    describe('helpers hash', () => {
        it('providing a helpers hash', () => {
            (0, test_bench_1.expectTemplate)('Goodbye {{cruel}} {{world}}!')
                .withInput({ cruel: 'cruel' })
                .withHelpers({
                world() {
                    return 'world';
                },
            })
                .toCompileTo('Goodbye cruel world!');
            (0, test_bench_1.expectTemplate)('Goodbye {{#iter}}{{cruel}} {{world}}{{/iter}}!')
                .withInput({ iter: [{ cruel: 'cruel' }] })
                .withHelpers({
                world() {
                    return 'world';
                },
            })
                .toCompileTo('Goodbye cruel world!');
        });
        it('in cases of conflict, helpers win', () => {
            (0, test_bench_1.expectTemplate)('{{{lookup}}}')
                .withInput({ lookup: 'Explicit' })
                .withHelpers({
                lookup() {
                    return 'helpers';
                },
            })
                .toCompileTo('helpers');
            (0, test_bench_1.expectTemplate)('{{lookup}}')
                .withInput({ lookup: 'Explicit' })
                .withHelpers({
                lookup() {
                    return 'helpers';
                },
            })
                .toCompileTo('helpers');
        });
        it('the helpers hash is available is nested contexts', () => {
            (0, test_bench_1.expectTemplate)('{{#outer}}{{#inner}}{{helper}}{{/inner}}{{/outer}}')
                .withInput({ outer: { inner: { unused: [] } } })
                .withHelpers({
                helper() {
                    return 'helper';
                },
            })
                .toCompileTo('helper');
        });
        it('the helper hash should augment the global hash', () => {
            kbnHandlebarsEnv.registerHelper('test_helper', function () {
                return 'found it!';
            });
            (0, test_bench_1.expectTemplate)('{{test_helper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}')
                .withInput({ cruel: 'cruel' })
                .withHelpers({
                world() {
                    return 'world!';
                },
            })
                .toCompileTo('found it! Goodbye cruel world!!');
        });
    });
    describe('registration', () => {
        it('unregisters', () => {
            deleteAllKeys(kbnHandlebarsEnv.helpers);
            kbnHandlebarsEnv.registerHelper('foo', function () {
                return 'fail';
            });
            expect(kbnHandlebarsEnv.helpers.foo).toBeDefined();
            kbnHandlebarsEnv.unregisterHelper('foo');
            expect(kbnHandlebarsEnv.helpers.foo).toBeUndefined();
        });
        it('allows multiple globals', () => {
            const ifHelper = kbnHandlebarsEnv.helpers.if;
            deleteAllKeys(kbnHandlebarsEnv.helpers);
            kbnHandlebarsEnv.registerHelper({
                if: ifHelper,
                world() {
                    return 'world!';
                },
                testHelper() {
                    return 'found it!';
                },
            });
            (0, test_bench_1.expectTemplate)('{{testHelper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}')
                .withInput({ cruel: 'cruel' })
                .toCompileTo('found it! Goodbye cruel world!!');
        });
        it('fails with multiple and args', () => {
            expect(() => {
                kbnHandlebarsEnv.registerHelper(
                // @ts-expect-error TypeScript is complaining about the invalid input just as the thrown error
                {
                    world() {
                        return 'world!';
                    },
                    testHelper() {
                        return 'found it!';
                    },
                }, {});
            }).toThrow('Arg not supported with multiple helpers');
        });
    });
    it('decimal number literals work', () => {
        (0, test_bench_1.expectTemplate)('Message: {{hello -1.2 1.2}}')
            .withHelper('hello', function (times, times2) {
            if (typeof times !== 'number') {
                times = 'NaN';
            }
            if (typeof times2 !== 'number') {
                times2 = 'NaN';
            }
            return 'Hello ' + times + ' ' + times2 + ' times';
        })
            .toCompileTo('Message: Hello -1.2 1.2 times');
    });
    it('negative number literals work', () => {
        (0, test_bench_1.expectTemplate)('Message: {{hello -12}}')
            .withHelper('hello', function (times) {
            if (typeof times !== 'number') {
                times = 'NaN';
            }
            return 'Hello ' + times + ' times';
        })
            .toCompileTo('Message: Hello -12 times');
    });
    describe('String literal parameters', () => {
        it('simple literals work', () => {
            (0, test_bench_1.expectTemplate)('Message: {{hello "world" 12 true false}}')
                .withHelper('hello', function (param, times, bool1, bool2) {
                if (typeof times !== 'number') {
                    times = 'NaN';
                }
                if (typeof bool1 !== 'boolean') {
                    bool1 = 'NaB';
                }
                if (typeof bool2 !== 'boolean') {
                    bool2 = 'NaB';
                }
                return 'Hello ' + param + ' ' + times + ' times: ' + bool1 + ' ' + bool2;
            })
                .toCompileTo('Message: Hello world 12 times: true false');
        });
        it('using a quote in the middle of a parameter raises an error', () => {
            (0, test_bench_1.expectTemplate)('Message: {{hello wo"rld"}}').toThrow(Error);
        });
        it('escaping a String is possible', () => {
            (0, test_bench_1.expectTemplate)('Message: {{{hello "\\"world\\""}}}')
                .withHelper('hello', function (param) {
                return 'Hello ' + param;
            })
                .toCompileTo('Message: Hello "world"');
        });
        it("it works with ' marks", () => {
            (0, test_bench_1.expectTemplate)('Message: {{{hello "Alan\'s world"}}}')
                .withHelper('hello', function (param) {
                return 'Hello ' + param;
            })
                .toCompileTo("Message: Hello Alan's world");
        });
    });
    describe('multiple parameters', () => {
        it('simple multi-params work', () => {
            (0, test_bench_1.expectTemplate)('Message: {{goodbye cruel world}}')
                .withInput({ cruel: 'cruel', world: 'world' })
                .withHelper('goodbye', function (cruel, world) {
                return 'Goodbye ' + cruel + ' ' + world;
            })
                .toCompileTo('Message: Goodbye cruel world');
        });
        it('block multi-params work', () => {
            (0, test_bench_1.expectTemplate)('Message: {{#goodbye cruel world}}{{greeting}} {{adj}} {{noun}}{{/goodbye}}')
                .withInput({ cruel: 'cruel', world: 'world' })
                .withHelper('goodbye', function (cruel, world, options) {
                return options.fn({ greeting: 'Goodbye', adj: cruel, noun: world });
            })
                .toCompileTo('Message: Goodbye cruel world');
        });
    });
    describe('hash', () => {
        it('helpers can take an optional hash', () => {
            (0, test_bench_1.expectTemplate)('{{goodbye cruel="CRUEL" world="WORLD" times=12}}')
                .withHelper('goodbye', function (options) {
                return ('GOODBYE ' +
                    options.hash.cruel +
                    ' ' +
                    options.hash.world +
                    ' ' +
                    options.hash.times +
                    ' TIMES');
            })
                .toCompileTo('GOODBYE CRUEL WORLD 12 TIMES');
        });
        it('helpers can take an optional hash with booleans', () => {
            function goodbye(options) {
                if (options.hash.print === true) {
                    return 'GOODBYE ' + options.hash.cruel + ' ' + options.hash.world;
                }
                else if (options.hash.print === false) {
                    return 'NOT PRINTING';
                }
                else {
                    return 'THIS SHOULD NOT HAPPEN';
                }
            }
            (0, test_bench_1.expectTemplate)('{{goodbye cruel="CRUEL" world="WORLD" print=true}}')
                .withHelper('goodbye', goodbye)
                .toCompileTo('GOODBYE CRUEL WORLD');
            (0, test_bench_1.expectTemplate)('{{goodbye cruel="CRUEL" world="WORLD" print=false}}')
                .withHelper('goodbye', goodbye)
                .toCompileTo('NOT PRINTING');
        });
        it('block helpers can take an optional hash', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}')
                .withHelper('goodbye', function (options) {
                return ('GOODBYE ' +
                    options.hash.cruel +
                    ' ' +
                    options.fn(this) +
                    ' ' +
                    options.hash.times +
                    ' TIMES');
            })
                .toCompileTo('GOODBYE CRUEL world 12 TIMES');
        });
        it('block helpers can take an optional hash with single quoted stings', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbye cruel="CRUEL" times=12}}world{{/goodbye}}')
                .withHelper('goodbye', function (options) {
                return ('GOODBYE ' +
                    options.hash.cruel +
                    ' ' +
                    options.fn(this) +
                    ' ' +
                    options.hash.times +
                    ' TIMES');
            })
                .toCompileTo('GOODBYE CRUEL world 12 TIMES');
        });
        it('block helpers can take an optional hash with booleans', () => {
            function goodbye(options) {
                if (options.hash.print === true) {
                    return 'GOODBYE ' + options.hash.cruel + ' ' + options.fn(this);
                }
                else if (options.hash.print === false) {
                    return 'NOT PRINTING';
                }
                else {
                    return 'THIS SHOULD NOT HAPPEN';
                }
            }
            (0, test_bench_1.expectTemplate)('{{#goodbye cruel="CRUEL" print=true}}world{{/goodbye}}')
                .withHelper('goodbye', goodbye)
                .toCompileTo('GOODBYE CRUEL world');
            (0, test_bench_1.expectTemplate)('{{#goodbye cruel="CRUEL" print=false}}world{{/goodbye}}')
                .withHelper('goodbye', goodbye)
                .toCompileTo('NOT PRINTING');
        });
    });
    describe('helperMissing', () => {
        it('if a context is not found, helperMissing is used', () => {
            (0, test_bench_1.expectTemplate)('{{hello}} {{link_to world}}').toThrow(/Missing helper: "link_to"/);
        });
        it('if a context is not found, custom helperMissing is used', () => {
            (0, test_bench_1.expectTemplate)('{{hello}} {{link_to world}}')
                .withInput({ hello: 'Hello', world: 'world' })
                .withHelper('helperMissing', function (mesg, options) {
                if (options.name === 'link_to') {
                    return new __1.default.SafeString('<a>' + mesg + '</a>');
                }
            })
                .toCompileTo('Hello <a>world</a>');
        });
        it('if a value is not found, custom helperMissing is used', () => {
            (0, test_bench_1.expectTemplate)('{{hello}} {{link_to}}')
                .withInput({ hello: 'Hello', world: 'world' })
                .withHelper('helperMissing', function (options) {
                if (options.name === 'link_to') {
                    return new __1.default.SafeString('<a>winning</a>');
                }
            })
                .toCompileTo('Hello <a>winning</a>');
        });
    });
    describe('knownHelpers', () => {
        it('Known helper should render helper', () => {
            (0, test_bench_1.expectTemplate)('{{hello}}')
                .withCompileOptions({
                knownHelpers: { hello: true },
            })
                .withHelper('hello', function () {
                return 'foo';
            })
                .toCompileTo('foo');
        });
        it('Unknown helper in knownHelpers only mode should be passed as undefined', () => {
            (0, test_bench_1.expectTemplate)('{{typeof hello}}')
                .withCompileOptions({
                knownHelpers: { typeof: true },
                knownHelpersOnly: true,
            })
                .withHelper('typeof', function (arg) {
                return typeof arg;
            })
                .withHelper('hello', function () {
                return 'foo';
            })
                .toCompileTo('undefined');
        });
        it('Builtin helpers available in knownHelpers only mode', () => {
            (0, test_bench_1.expectTemplate)('{{#unless foo}}bar{{/unless}}')
                .withCompileOptions({
                knownHelpersOnly: true,
            })
                .toCompileTo('bar');
        });
        it('Field lookup works in knownHelpers only mode', () => {
            (0, test_bench_1.expectTemplate)('{{foo}}')
                .withCompileOptions({
                knownHelpersOnly: true,
            })
                .withInput({ foo: 'bar' })
                .toCompileTo('bar');
        });
        it('Conditional blocks work in knownHelpers only mode', () => {
            (0, test_bench_1.expectTemplate)('{{#foo}}bar{{/foo}}')
                .withCompileOptions({
                knownHelpersOnly: true,
            })
                .withInput({ foo: 'baz' })
                .toCompileTo('bar');
        });
        it('Invert blocks work in knownHelpers only mode', () => {
            (0, test_bench_1.expectTemplate)('{{^foo}}bar{{/foo}}')
                .withCompileOptions({
                knownHelpersOnly: true,
            })
                .withInput({ foo: false })
                .toCompileTo('bar');
        });
        it('Functions are bound to the context in knownHelpers only mode', () => {
            (0, test_bench_1.expectTemplate)('{{foo}}')
                .withCompileOptions({
                knownHelpersOnly: true,
            })
                .withInput({
                foo() {
                    return this.bar;
                },
                bar: 'bar',
            })
                .toCompileTo('bar');
        });
        it('Unknown helper call in knownHelpers only mode should throw', () => {
            (0, test_bench_1.expectTemplate)('{{typeof hello}}')
                .withCompileOptions({ knownHelpersOnly: true })
                .toThrow(Error);
        });
    });
    describe('blockHelperMissing', () => {
        it('lambdas are resolved by blockHelperMissing, not handlebars proper', () => {
            (0, test_bench_1.expectTemplate)('{{#truthy}}yep{{/truthy}}')
                .withInput({
                truthy() {
                    return true;
                },
            })
                .toCompileTo('yep');
        });
        it('lambdas resolved by blockHelperMissing are bound to the context', () => {
            (0, test_bench_1.expectTemplate)('{{#truthy}}yep{{/truthy}}')
                .withInput({
                truthy() {
                    return this.truthiness();
                },
                truthiness() {
                    return false;
                },
            })
                .toCompileTo('');
        });
    });
    describe('name field', () => {
        const helpers = {
            blockHelperMissing(...args) {
                return 'missing: ' + args[args.length - 1].name;
            },
            helperMissing(...args) {
                return 'helper missing: ' + args[args.length - 1].name;
            },
            helper(...args) {
                return 'ran: ' + args[args.length - 1].name;
            },
        };
        it('should include in ambiguous mustache calls', () => {
            (0, test_bench_1.expectTemplate)('{{helper}}').withHelpers(helpers).toCompileTo('ran: helper');
        });
        it('should include in helper mustache calls', () => {
            (0, test_bench_1.expectTemplate)('{{helper 1}}').withHelpers(helpers).toCompileTo('ran: helper');
        });
        it('should include in ambiguous block calls', () => {
            (0, test_bench_1.expectTemplate)('{{#helper}}{{/helper}}').withHelpers(helpers).toCompileTo('ran: helper');
        });
        it('should include in simple block calls', () => {
            (0, test_bench_1.expectTemplate)('{{#./helper}}{{/./helper}}')
                .withHelpers(helpers)
                .toCompileTo('missing: ./helper');
        });
        it('should include in helper block calls', () => {
            (0, test_bench_1.expectTemplate)('{{#helper 1}}{{/helper}}').withHelpers(helpers).toCompileTo('ran: helper');
        });
        it('should include in known helper calls', () => {
            (0, test_bench_1.expectTemplate)('{{helper}}')
                .withCompileOptions({
                knownHelpers: { helper: true },
                knownHelpersOnly: true,
            })
                .withHelpers(helpers)
                .toCompileTo('ran: helper');
        });
        it('should include full id', () => {
            (0, test_bench_1.expectTemplate)('{{#foo.helper}}{{/foo.helper}}')
                .withInput({ foo: {} })
                .withHelpers(helpers)
                .toCompileTo('missing: foo.helper');
        });
        it('should include full id if a hash is passed', () => {
            (0, test_bench_1.expectTemplate)('{{#foo.helper bar=baz}}{{/foo.helper}}')
                .withInput({ foo: {} })
                .withHelpers(helpers)
                .toCompileTo('helper missing: foo.helper');
        });
    });
    describe('name conflicts', () => {
        it('helpers take precedence over same-named context properties', () => {
            (0, test_bench_1.expectTemplate)('{{goodbye}} {{cruel world}}')
                .withHelper('goodbye', function () {
                return this.goodbye.toUpperCase();
            })
                .withHelper('cruel', function (world) {
                return 'cruel ' + world.toUpperCase();
            })
                .withInput({
                goodbye: 'goodbye',
                world: 'world',
            })
                .toCompileTo('GOODBYE cruel WORLD');
        });
        it('helpers take precedence over same-named context properties$', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbye}} {{cruel world}}{{/goodbye}}')
                .withHelper('goodbye', function (options) {
                return this.goodbye.toUpperCase() + options.fn(this);
            })
                .withHelper('cruel', function (world) {
                return 'cruel ' + world.toUpperCase();
            })
                .withInput({
                goodbye: 'goodbye',
                world: 'world',
            })
                .toCompileTo('GOODBYE cruel WORLD');
        });
        it('Scoped names take precedence over helpers', () => {
            (0, test_bench_1.expectTemplate)('{{this.goodbye}} {{cruel world}} {{cruel this.goodbye}}')
                .withHelper('goodbye', function () {
                return this.goodbye.toUpperCase();
            })
                .withHelper('cruel', function (world) {
                return 'cruel ' + world.toUpperCase();
            })
                .withInput({
                goodbye: 'goodbye',
                world: 'world',
            })
                .toCompileTo('goodbye cruel WORLD cruel GOODBYE');
        });
        it('Scoped names take precedence over block helpers', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbye}} {{cruel world}}{{/goodbye}} {{this.goodbye}}')
                .withHelper('goodbye', function (options) {
                return this.goodbye.toUpperCase() + options.fn(this);
            })
                .withHelper('cruel', function (world) {
                return 'cruel ' + world.toUpperCase();
            })
                .withInput({
                goodbye: 'goodbye',
                world: 'world',
            })
                .toCompileTo('GOODBYE cruel WORLD goodbye');
        });
    });
    describe('block params', () => {
        it('should take presedence over context values', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}')
                .withInput({ value: 'foo' })
                .withHelper('goodbyes', function (options) {
                expect(options.fn.blockParams).toEqual(1);
                return options.fn({ value: 'bar' }, { blockParams: [1, 2] });
            })
                .toCompileTo('1foo');
        });
        it('should take presedence over helper values', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{value}}')
                .withHelper('value', function () {
                return 'foo';
            })
                .withHelper('goodbyes', function (options) {
                expect(options.fn.blockParams).toEqual(1);
                return options.fn({}, { blockParams: [1, 2] });
            })
                .toCompileTo('1foo');
        });
        it('should not take presedence over pathed values', () => {
            (0, test_bench_1.expectTemplate)('{{#goodbyes as |value|}}{{./value}}{{/goodbyes}}{{value}}')
                .withInput({ value: 'bar' })
                .withHelper('value', function () {
                return 'foo';
            })
                .withHelper('goodbyes', function (options) {
                expect(options.fn.blockParams).toEqual(1);
                return options.fn(this, { blockParams: [1, 2] });
            })
                .toCompileTo('barfoo');
        });
        it('should take presednece over parent block params', () => {
            let value;
            (0, test_bench_1.expectTemplate)('{{#goodbyes as |value|}}{{#goodbyes}}{{value}}{{#goodbyes as |value|}}{{value}}{{/goodbyes}}{{/goodbyes}}{{/goodbyes}}{{value}}', {
                beforeEach() {
                    value = 1;
                },
            })
                .withInput({ value: 'foo' })
                .withHelper('goodbyes', function (options) {
                return options.fn({ value: 'bar' }, {
                    blockParams: options.fn.blockParams === 1 ? [value++, value++] : undefined,
                });
            })
                .toCompileTo('13foo');
        });
        it('should allow block params on chained helpers', () => {
            (0, test_bench_1.expectTemplate)('{{#if bar}}{{else goodbyes as |value|}}{{value}}{{/if}}{{value}}')
                .withInput({ value: 'foo' })
                .withHelper('goodbyes', function (options) {
                expect(options.fn.blockParams).toEqual(1);
                return options.fn({ value: 'bar' }, { blockParams: [1, 2] });
            })
                .toCompileTo('1foo');
        });
    });
    describe('built-in helpers malformed arguments ', () => {
        it('if helper - too few arguments', () => {
            (0, test_bench_1.expectTemplate)('{{#if}}{{/if}}').toThrow(/#if requires exactly one argument/);
        });
        it('if helper - too many arguments, string', () => {
            (0, test_bench_1.expectTemplate)('{{#if test "string"}}{{/if}}').toThrow(/#if requires exactly one argument/);
        });
        it('if helper - too many arguments, undefined', () => {
            (0, test_bench_1.expectTemplate)('{{#if test undefined}}{{/if}}').toThrow(/#if requires exactly one argument/);
        });
        it('if helper - too many arguments, null', () => {
            (0, test_bench_1.expectTemplate)('{{#if test null}}{{/if}}').toThrow(/#if requires exactly one argument/);
        });
        it('unless helper - too few arguments', () => {
            (0, test_bench_1.expectTemplate)('{{#unless}}{{/unless}}').toThrow(/#unless requires exactly one argument/);
        });
        it('unless helper - too many arguments', () => {
            (0, test_bench_1.expectTemplate)('{{#unless test null}}{{/unless}}').toThrow(/#unless requires exactly one argument/);
        });
        it('with helper - too few arguments', () => {
            (0, test_bench_1.expectTemplate)('{{#with}}{{/with}}').toThrow(/#with requires exactly one argument/);
        });
        it('with helper - too many arguments', () => {
            (0, test_bench_1.expectTemplate)('{{#with test "string"}}{{/with}}').toThrow(/#with requires exactly one argument/);
        });
    });
    describe('the lookupProperty-option', () => {
        it('should be passed to custom helpers', () => {
            (0, test_bench_1.expectTemplate)('{{testHelper}}')
                .withHelper('testHelper', function testHelper(options) {
                return options.lookupProperty(this, 'testProperty');
            })
                .withInput({ testProperty: 'abc' })
                .toCompileTo('abc');
        });
    });
});
function deleteAllKeys(obj) {
    for (const key of Object.keys(obj)) {
        delete obj[key];
    }
}
