import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

import reactConfig from './react.mjs';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const nextCompatConfig = compat.extends('next/core-web-vitals', 'next/typescript');

const nextConfig = [
  ...reactConfig,
  ...nextCompatConfig,
];

export default nextConfig;
