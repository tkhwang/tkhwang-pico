import baseConfig from '@tkhwang-pico/config-eslint-prettier/eslint/nest';

const eslintConfig = [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        sourceType: 'commonjs',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:', '^(fs|path|os|crypto|stream|http|https|url|util|querystring|child_process|cluster|dgram|dns|events|net|readline|repl|tls|tty|v8|vm|zlib)(/.*)?$'],
            ['^@?\\w'],
            ['^@tkhwang-pico'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.?(types)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
];

export default eslintConfig;
