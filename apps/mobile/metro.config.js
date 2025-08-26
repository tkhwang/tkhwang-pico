const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure for yarn workspace
config.watchFolders = [
  path.resolve(__dirname, '../../node_modules'),
  path.resolve(__dirname, '../../'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../../node_modules'),
];

// Force React to resolve from root node_modules only
config.resolver.alias = {
  react: path.resolve(__dirname, '../../node_modules/react'),
  'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
};

// Completely block any local React installations
config.resolver.blockList = [
  new RegExp(`${path.resolve(__dirname, 'node_modules/react')}/.*`),
  new RegExp(`${path.resolve(__dirname, 'node_modules/react-dom')}/.*`),
  new RegExp(`${path.resolve(__dirname, '../web/node_modules/react')}/.*`),
  new RegExp(`${path.resolve(__dirname, '../mastra/node_modules/react')}/.*`),
];

module.exports = withNativeWind(config, { input: './global.css' });
