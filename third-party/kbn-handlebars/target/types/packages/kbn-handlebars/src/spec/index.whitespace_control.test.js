"use strict";
/*
 * This file is forked from the handlebars project (https://github.com/handlebars-lang/handlebars.js),
 * and may include modifications made by Elasticsearch B.V.
 * Elasticsearch B.V. licenses this file to you under the MIT License.
 * See `packages/kbn-handlebars/LICENSE` for more information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const test_bench_1 = require("../__jest__/test_bench");
describe('whitespace control', () => {
    it('should strip whitespace around mustache calls', () => {
        const hash = { foo: 'bar<' };
        (0, test_bench_1.expectTemplate)(' {{~foo~}} ').withInput(hash).toCompileTo('bar&lt;');
        (0, test_bench_1.expectTemplate)(' {{~foo}} ').withInput(hash).toCompileTo('bar&lt; ');
        (0, test_bench_1.expectTemplate)(' {{foo~}} ').withInput(hash).toCompileTo(' bar&lt;');
        (0, test_bench_1.expectTemplate)(' {{~&foo~}} ').withInput(hash).toCompileTo('bar<');
        (0, test_bench_1.expectTemplate)(' {{~{foo}~}} ').withInput(hash).toCompileTo('bar<');
        (0, test_bench_1.expectTemplate)('1\n{{foo~}} \n\n 23\n{{bar}}4').toCompileTo('1\n23\n4');
    });
    describe('blocks', () => {
        it('should strip whitespace around simple block calls', () => {
            const hash = { foo: 'bar<' };
            (0, test_bench_1.expectTemplate)(' {{~#if foo~}} bar {{~/if~}} ').withInput(hash).toCompileTo('bar');
            (0, test_bench_1.expectTemplate)(' {{#if foo~}} bar {{/if~}} ').withInput(hash).toCompileTo(' bar ');
            (0, test_bench_1.expectTemplate)(' {{~#if foo}} bar {{~/if}} ').withInput(hash).toCompileTo(' bar ');
            (0, test_bench_1.expectTemplate)(' {{#if foo}} bar {{/if}} ').withInput(hash).toCompileTo('  bar  ');
            (0, test_bench_1.expectTemplate)(' \n\n{{~#if foo~}} \n\nbar \n\n{{~/if~}}\n\n ')
                .withInput(hash)
                .toCompileTo('bar');
            (0, test_bench_1.expectTemplate)(' a\n\n{{~#if foo~}} \n\nbar \n\n{{~/if~}}\n\na ')
                .withInput(hash)
                .toCompileTo(' abara ');
        });
        it('should strip whitespace around inverse block calls', () => {
            (0, test_bench_1.expectTemplate)(' {{~^if foo~}} bar {{~/if~}} ').toCompileTo('bar');
            (0, test_bench_1.expectTemplate)(' {{^if foo~}} bar {{/if~}} ').toCompileTo(' bar ');
            (0, test_bench_1.expectTemplate)(' {{~^if foo}} bar {{~/if}} ').toCompileTo(' bar ');
            (0, test_bench_1.expectTemplate)(' {{^if foo}} bar {{/if}} ').toCompileTo('  bar  ');
            (0, test_bench_1.expectTemplate)(' \n\n{{~^if foo~}} \n\nbar \n\n{{~/if~}}\n\n ').toCompileTo('bar');
        });
        it('should strip whitespace around complex block calls', () => {
            const hash = { foo: 'bar<' };
            (0, test_bench_1.expectTemplate)('{{#if foo~}} bar {{~^~}} baz {{~/if}}').withInput(hash).toCompileTo('bar');
            (0, test_bench_1.expectTemplate)('{{#if foo~}} bar {{^~}} baz {{/if}}').withInput(hash).toCompileTo('bar ');
            (0, test_bench_1.expectTemplate)('{{#if foo}} bar {{~^~}} baz {{~/if}}').withInput(hash).toCompileTo(' bar');
            (0, test_bench_1.expectTemplate)('{{#if foo}} bar {{^~}} baz {{/if}}').withInput(hash).toCompileTo(' bar ');
            (0, test_bench_1.expectTemplate)('{{#if foo~}} bar {{~else~}} baz {{~/if}}').withInput(hash).toCompileTo('bar');
            (0, test_bench_1.expectTemplate)('\n\n{{~#if foo~}} \n\nbar \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n')
                .withInput(hash)
                .toCompileTo('bar');
            (0, test_bench_1.expectTemplate)('\n\n{{~#if foo~}} \n\n{{{foo}}} \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n')
                .withInput(hash)
                .toCompileTo('bar<');
            (0, test_bench_1.expectTemplate)('{{#if foo~}} bar {{~^~}} baz {{~/if}}').toCompileTo('baz');
            (0, test_bench_1.expectTemplate)('{{#if foo}} bar {{~^~}} baz {{/if}}').toCompileTo('baz ');
            (0, test_bench_1.expectTemplate)('{{#if foo~}} bar {{~^}} baz {{~/if}}').toCompileTo(' baz');
            (0, test_bench_1.expectTemplate)('{{#if foo~}} bar {{~^}} baz {{/if}}').toCompileTo(' baz ');
            (0, test_bench_1.expectTemplate)('{{#if foo~}} bar {{~else~}} baz {{~/if}}').toCompileTo('baz');
            (0, test_bench_1.expectTemplate)('\n\n{{~#if foo~}} \n\nbar \n\n{{~^~}} \n\nbaz \n\n{{~/if~}}\n\n').toCompileTo('baz');
        });
    });
    it('should strip whitespace around partials', () => {
        (0, test_bench_1.expectTemplate)('foo {{~> dude~}} ').withPartials({ dude: 'bar' }).toCompileTo('foobar');
        (0, test_bench_1.expectTemplate)('foo {{> dude~}} ').withPartials({ dude: 'bar' }).toCompileTo('foo bar');
        (0, test_bench_1.expectTemplate)('foo {{> dude}} ').withPartials({ dude: 'bar' }).toCompileTo('foo bar ');
        (0, test_bench_1.expectTemplate)('foo\n {{~> dude}} ').withPartials({ dude: 'bar' }).toCompileTo('foobar');
        (0, test_bench_1.expectTemplate)('foo\n {{> dude}} ').withPartials({ dude: 'bar' }).toCompileTo('foo\n bar');
    });
    it('should only strip whitespace once', () => {
        (0, test_bench_1.expectTemplate)(' {{~foo~}} {{foo}} {{foo}} ')
            .withInput({ foo: 'bar' })
            .toCompileTo('barbar bar ');
    });
});
