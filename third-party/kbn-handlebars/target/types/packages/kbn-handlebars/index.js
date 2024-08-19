"use strict";
/*
 * Elasticsearch B.V licenses this file to you under the MIT License.
 * See `packages/kbn-handlebars/LICENSE` for more information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileFnName = void 0;
const handlebars_1 = require("./src/handlebars");
const utils_1 = require("./src/utils");
// The handlebars module uses `export =`, so it can't be re-exported using `export *`.
// However, because of Babel, we're not allowed to use `export =` ourselves.
// So we have to resort to using `exports default` even though eslint doesn't like it.
//
// eslint-disable-next-line import/no-default-export
exports.default = handlebars_1.Handlebars;
/**
 * If the `unsafe-eval` CSP is set, this string constant will be `compile`,
 * otherwise `compileAST`.
 *
 * This can be used to call the more optimized `compile` function in
 * environments that support it, or fall back to `compileAST` on environments
 * that don't.
 */
exports.compileFnName = (0, utils_1.allowUnsafeEval)() ? 'compile' : 'compileAST';
