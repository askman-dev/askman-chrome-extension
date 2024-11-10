import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        setTimeout: 'readonly',
        process: 'readonly',
        chrome: 'readonly',
        navigator: 'readonly',
        document: 'readonly',
        window: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        MouseEvent: 'readonly',
        MutationObserver: 'readonly',
        React: 'readonly',
        Document: 'readonly',
        Node: 'readonly',
        HTMLTextAreaElement: 'readonly',
        KeyboardEvent: 'readonly',
        Text: 'readonly',
        fetch: 'readonly',
        SVGSVGElement: 'readonly',
        DOMRect: 'readonly',
        requestAnimationFrame: 'readonly',
        global: 'readonly', // for unit test
        __dirname: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'none',
        },
      ],
    },
  },
];
