import baseConfig from '@tkhwang-pico/config-eslint-prettier/eslint/node';
import globals from 'globals';

const eslintConfig = [
  ...baseConfig,
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
    rules: {
      'no-process-env': 'off',
    },
  },
];

export default eslintConfig;
