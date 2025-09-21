# @tkhwang-pico/config-typescript

Shared TypeScript configuration presets for the monorepo.

## Usage

```jsonc
// tsconfig.json
{
  "extends": "@tkhwang-pico/config-typescript/next",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src"]
}
```

Available entry points:

- `@tkhwang-pico/config-typescript/base`
- `@tkhwang-pico/config-typescript/react`
- `@tkhwang-pico/config-typescript/react-native`
- `@tkhwang-pico/config-typescript/next`
- `@tkhwang-pico/config-typescript/expo`
- `@tkhwang-pico/config-typescript/nest`
- `@tkhwang-pico/config-typescript/node`
- `@tkhwang-pico/config-typescript/build`

Each package should extend the closest preset and override project-specific `paths`, `include`, or emit targets.
