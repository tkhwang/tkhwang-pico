# Shared tooling configuration

The monorepo now centralises TypeScript, ESLint, and Prettier settings through two internal workspace packages:

- `@tkhwang-pico/config-typescript` – base `tsconfig` presets for each runtime
- `@tkhwang-pico/config-eslint-prettier` – ESLint flat-config bundles and Prettier presets

## TypeScript

Available entry points:

- `@tkhwang-pico/config-typescript/base`
- `@tkhwang-pico/config-typescript/react`
- `@tkhwang-pico/config-typescript/react-native`
- `@tkhwang-pico/config-typescript/next`
- `@tkhwang-pico/config-typescript/expo`
- `@tkhwang-pico/config-typescript/nest`
- `@tkhwang-pico/config-typescript/node`
- `@tkhwang-pico/config-typescript/build`

Example usage:

```jsonc
// tsconfig.json
{
  "extends": "@tkhwang-pico/config-typescript/next",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src"]
}
```

Add only project-specific `paths`, `include`/`exclude`, and emit controls in consuming configs.

## ESLint

Each eslint preset exports a ready-to-spread flat config array:

- `@tkhwang-pico/config-eslint-prettier/eslint/base`
- `@tkhwang-pico/config-eslint-prettier/eslint/node`
- `@tkhwang-pico/config-eslint-prettier/eslint/react`
- `@tkhwang-pico/config-eslint-prettier/eslint/expo`
- `@tkhwang-pico/config-eslint-prettier/eslint/next`
- `@tkhwang-pico/config-eslint-prettier/eslint/nest`

Example:

```js
// eslint.config.mjs
import config from '@tkhwang-pico/config-eslint-prettier/eslint/next';

export default [
  ...config,
  {
    rules: {
      // local overrides
    },
  },
];
```

When adding a new workspace ensure its `devDependencies` satisfy the config package `peerDependencies` (ESLint 9+, `typescript-eslint`, prettier plugins, etc.).

## Prettier

Prettier configs are CommonJS modules for easy require:

- `@tkhwang-pico/config-eslint-prettier/prettier/base`
- `@tkhwang-pico/config-eslint-prettier/prettier/tailwind`

Example:

```js
// prettier.config.cjs
module.exports = require('@tkhwang-pico/config-eslint-prettier/prettier/tailwind');
```

## Rollout checklist

1. Update workspace `package.json` files with the required linting peer dependencies.
2. Run `yarn install` at the repo root to refresh the lockfile.
3. Validate with `yarn tsc --build` (or workspace type checks) and the relevant `yarn lint` targets.
4. Adjust CI pipelines to call workspace `lint`/`test` scripts after the dependency bump if necessary.
