# @tkhwang-pico/config-eslint-prettier

Shared ESLint flat-config presets and Prettier options for the monorepo.

## ESLint usage

```js
// eslint.config.mjs
import config from '@tkhwang-pico/config-eslint-prettier/eslint/next';

export default [
  ...config,
  // project-specific overrides
];
```

Available entry points:

- `@tkhwang-pico/config-eslint-prettier/eslint/base`
- `@tkhwang-pico/config-eslint-prettier/eslint/node`
- `@tkhwang-pico/config-eslint-prettier/eslint/react`
- `@tkhwang-pico/config-eslint-prettier/eslint/expo`
- `@tkhwang-pico/config-eslint-prettier/eslint/next`
- `@tkhwang-pico/config-eslint-prettier/eslint/nest`

Each preset returns a flat-config array ready to spread into your `eslint.config.mjs`.

## Prettier usage

```js
// prettier.config.cjs
module.exports = require('@tkhwang-pico/config-eslint-prettier/prettier/tailwind');
```

Exports:

- `@tkhwang-pico/config-eslint-prettier/prettier/base`
- `@tkhwang-pico/config-eslint-prettier/prettier/tailwind`

Choose the preset that best matches the target (Tailwind includes `prettier-plugin-tailwindcss`).
