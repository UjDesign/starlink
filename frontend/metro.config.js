const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce file watching to prevent EMFILE errors
config.watchFolders = [];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Reduce the number of workers to prevent file descriptor exhaustion
config.maxWorkers = 2;

// Exclude problematic directories from watching
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/.*/,
  /.*\/__tests__\/.*/,
];

module.exports = config;
