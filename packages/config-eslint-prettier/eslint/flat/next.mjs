import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

import reactConfig from "./react.mjs";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const nextCompatConfig = compat.extends(
  "next/core-web-vitals",
  "next/typescript"
);

const sanitizedNextCompatConfig = nextCompatConfig.map((config) => {
  if (!config.plugins || !("@typescript-eslint" in config.plugins)) {
    return config;
  }

  // Drop duplicate @typescript-eslint plugin definition; base config already registers it.
  const { ["@typescript-eslint"]: _ignored, ...restPlugins } = config.plugins;
  if (Object.keys(restPlugins).length === 0) {
    const { plugins, ...restConfig } = config;
    return restConfig;
  }

  return { ...config, plugins: restPlugins };
});

const nextConfig = [...reactConfig, ...sanitizedNextCompatConfig];

export default nextConfig;
