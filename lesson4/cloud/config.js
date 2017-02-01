const env = process.env.NODE_ENV || 'development';
const defaultConfig = require('./config/default');
const envConfig = require('./config/' + env);

const config = Object.assign({}, defaultConfig, envConfig);

module.exports = config;
