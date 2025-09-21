import globals from 'globals';
import reactNativePlugin from 'eslint-plugin-react-native';

import reactConfig from './react.mjs';

const reactNativeGlobals = globals['react-native'] || {};

const expoConfig = [
  ...reactConfig,
  {
    languageOptions: {
      globals: {
        ...reactNativeGlobals,
      },
    },
    plugins: {
      'react-native': reactNativePlugin,
    },
    rules: {
      'react-native/no-inline-styles': 'off',
    },
  },
];

export default expoConfig;
