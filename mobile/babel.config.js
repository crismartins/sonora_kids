module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      "./babel-plugins/scale-text.js",
      "react-native-reanimated/plugin",
    ],
  };
};
