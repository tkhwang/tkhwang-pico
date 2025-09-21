import baseConfig from '@tkhwang-pico/config-eslint-prettier/eslint/node';
import globals from 'globals';
import noInstanceof from 'eslint-plugin-no-instanceof';
import tseslint from 'typescript-eslint';

const eslintConfig = [
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'no-instanceof': noInstanceof,
    },
    rules: {
      'no-process-env': 'error',
      'no-instanceof/no-instanceof': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'class-methods-use-this': 'off',
      'consistent-return': 'off',
      'keyword-spacing': 'error',
      'max-classes-per-file': 'off',
      'no-await-in-loop': 'off',
      'no-bitwise': 'off',
      'no-console': 'off',
      'no-continue': 'off',
      'no-else-return': 'off',
      'no-restricted-syntax': 'off',
      'no-return-await': 'off',
      'no-shadow': 'off',
      'no-underscore-dangle': 'off',
      'no-use-before-define': 'off',
      'new-cap': ['error', { properties: false, capIsNew: false }],
      'import/extensions': ['error', 'ignorePackages'],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.test.ts'],
        },
      ],
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
    },
  },
];

export default eslintConfig;
