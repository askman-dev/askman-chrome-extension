import { describe, test, expect } from 'vitest';
import { extractUsedVars } from '@src/chat/utils/template-utils';

describe('Template Variable Extraction', () => {
  test('should extract simple variables', () => {
    const template = '{{foo}} {{bar}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo', 'bar']));
  });

  test('should extract dot notation variables', () => {
    const template = '{{foo.bar}} {{foo.baz}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo.bar', 'foo.baz']));
  });

  test('should extract path notation variables', () => {
    const template = '{{foo/bar}} {{foo/baz}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo/bar', 'foo/baz']));
  });

  test('should extract @variables', () => {
    const template = '{{@foo}} {{@bar}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo', 'bar']));
  });

  test('should extract literal bracket variables', () => {
    const template = '{{[foo bar]}} {{[baz qux]}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo bar', 'baz qux']));
  });

  test('should extract quoted literal variables', () => {
    const template = '{{"foo bar"}} {{"baz qux"}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo bar', 'baz qux']));
  });

  test('should handle mixed variable formats', () => {
    const template = '{{foo}} {{foo.bar}} {{foo/baz}} {{@qux}} {{[quux]}} {{"corge"}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo', 'foo.bar', 'foo/baz', 'qux', 'quux', 'corge']));
  });

  test('should handle if statements', () => {
    const template = '{{#if foo}}yes{{/if}} {{#if foo.bar}}yes{{/if}}';
    const usedVars = extractUsedVars(template);
    expect(usedVars).toEqual(new Set(['foo', 'foo.bar']));
  });

  describe('Edge Cases', () => {
    test('should handle empty template', () => {
      const template = '';
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set());
    });

    test('should handle template with no variables', () => {
      const template = 'Hello, world!';
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set());
    });

    test('should handle malformed variables', () => {
      const template = '{{ foo}} {{bar }} {{ baz }}';
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set(['foo', 'bar', 'baz']));
    });

    test('should handle incomplete variables', () => {
      const template = '{{foo}} {{bar} {baz}}';
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set(['foo']));
    });

    test('should handle nested variables', () => {
      const template = '{{#if foo}}{{#if bar}}{{baz}}{{/if}}{{/if}}';
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set(['foo', 'bar', 'baz']));
    });

    test('should handle escaped variables', () => {
      const template = '\\{{foo}} {{bar}}';
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set(['bar']));
    });

    test('should handle special characters in quoted variables', () => {
      const template = '{{"foo-bar"}} {{"baz_qux"}} {{"corge!"}}';
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set(['foo-bar', 'baz_qux', 'corge!']));
    });
  });

  describe('Error Cases', () => {
    test('should throw on non-string input', () => {
      const template = null;
      expect(() => extractUsedVars(template as unknown as string)).toThrow('Template must be a string');
    });

    test('should throw on empty variable names', () => {
      const template = '{{  }}';
      expect(() => extractUsedVars(template)).toThrow(/Empty variable name found in template/);
    });

    test('should throw on malformed brackets', () => {
      const template = '{{ foo}} {{] bar}} {{[baz}';
      expect(() => extractUsedVars(template)).toThrow(/Failed to parse template/);
    });

    test('should throw on unclosed quotes', () => {
      const template = '{{"foo}} {{"bar"}} {{\'baz}}';
      expect(() => extractUsedVars(template)).toThrow(/Failed to parse template/);
    });
  });

  describe('Real World Cases', () => {
    test('should handle page template variables', () => {
      const template = `
        {{#if page.title}}<title>{{page.title}}</title>{{/if}}
        {{#if page.url}}<url>{{page.url}}</url>{{/if}}
        {{#if page.content}}<content>{{page.content}}</content>{{/if}}
        {{#if page.selection}}<selection>{{page.selection}}</selection>{{/if}}
      `;
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set(['page.title', 'page.url', 'page.content', 'page.selection']));
    });

    test('should handle chat template variables', () => {
      const template = `
        {{chat.input}}
        {{chat.language}}
      `;
      const usedVars = extractUsedVars(template);
      expect(usedVars).toEqual(new Set(['chat.input', 'chat.language']));
    });
  });
});
