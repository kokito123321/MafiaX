module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Remove any problematic transforms that might conflict with expo-router
    ],
  };
};
