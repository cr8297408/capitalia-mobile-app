module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      require.resolve('expo-router/babel'),
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            'hooks': './hooks',
          },
          extensions: [
            '.ios.ts', '.android.ts', '.ts', '.tsx',
            '.ios.tsx', '.android.tsx',
            '.jsx', '.js', '.json'
          ],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
