const config = require('config');
const serverConfig = config.get('SERVER');

module.exports.getBase = () => {
    return `${serverConfig.URL}:${serverConfig.PORT}`;
};

module.exports.getFull = () => {
    return `${serverConfig.URL}:${serverConfig.PORT}/v${serverConfig.VERSION}/api`;
};

module.exports.getRelative = () => {
    return `v${serverConfig.VERSION}/api`;
};