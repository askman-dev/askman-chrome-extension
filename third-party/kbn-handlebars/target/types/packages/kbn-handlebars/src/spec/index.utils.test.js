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
describe('utils', function () {
    describe('#SafeString', function () {
        it('constructing a safestring from a string and checking its type', function () {
            const safe = new __1.default.SafeString('testing 1, 2, 3');
            expect(safe).toBeInstanceOf(__1.default.SafeString);
            expect(safe.toString()).toEqual('testing 1, 2, 3');
        });
        it('it should not escape SafeString properties', function () {
            const name = new __1.default.SafeString('<em>Sean O&#x27;Malley</em>');
            (0, test_bench_1.expectTemplate)('{{name}}').withInput({ name }).toCompileTo('<em>Sean O&#x27;Malley</em>');
        });
    });
});
