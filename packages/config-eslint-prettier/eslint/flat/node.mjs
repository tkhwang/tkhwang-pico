import globals from 'globals';

import baseConfig from './base.mjs';

const nodeConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];

export default nodeConfig;
