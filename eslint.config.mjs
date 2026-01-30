import esLint from '@eslint/js';
import tsLint from 'typescript-eslint';
import esLintPrettier from 'eslint-plugin-prettier/recommended';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultFiles = ['src/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}', 'scripts/**/*.ts'];

const defaultConfig = tsLint.config(
  esLint.configs.recommended,
  ...tsLint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'max-len': ['warn', { code: 120, tabWidth: 2 }],
      'eol-last': ['error', 'always'],
      'brace-style': ['error', 'stroustrup'],
      'no-console': 'warn',
      'no-unused-vars': 'off',
      'object-curly-newline': [
        'error',
        {
          ObjectExpression: { consistent: true },
          ObjectPattern: { consistent: true },
        },
      ],
      'object-curly-spacing': ['error', 'always'],
      'no-trailing-spaces': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-namespace': [
        'error',
        {
          allowDeclarations: true,
        },
      ],
    },
  },
  esLintPrettier,
);

const globalIgnores = {
  ignores: ['dist/**', 'node_modules/**', '*.config.mjs', '*.config.js'],
};

export default [
  ...defaultConfig.map((config) => ({ ...config, files: defaultFiles })),
  globalIgnores,
];
