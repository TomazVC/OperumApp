const {getDefaultConfig} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações específicas para web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configurar resolução de arquivos WASM como assets (não como source)
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'wasm');

module.exports = config;

