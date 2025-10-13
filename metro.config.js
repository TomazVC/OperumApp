const {getDefaultConfig} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações específicas para web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
