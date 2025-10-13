module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/shared': './src/shared',
            '@/core': './src/core',
            '@/modules': './src/modules',
          },
        },
      ],
    ],
  };
};
