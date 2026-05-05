const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix expo-router transform issues
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Add any needed aliases here
};

config.transformer = {
  ...config.transformer,
  // Ensure proper transformer configuration
  babelTransformerPath: require.resolve("metro-react-native-babel-transformer"),
};

config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = config;
