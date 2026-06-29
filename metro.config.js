// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle `.zip` files (the dev-seed sample dictionary) as binary assets.
config.resolver.assetExts.push('zip');

module.exports = config;
