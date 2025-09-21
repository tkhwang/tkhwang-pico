import baseConfig from '@tkhwang-pico/config-eslint-prettier/eslint/next';
import queryPlugin from '@tanstack/eslint-plugin-query';

const eslintConfig = [
  ...baseConfig,
  {
    plugins: { '@tanstack/query': queryPlugin },
    rules: {
      '@tanstack/query/exhaustive-deps': 'warn',
      '@tanstack/query/no-rest-destructuring': 'off',
    },
  },
];

export default eslintConfig;
