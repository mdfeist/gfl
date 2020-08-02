const config = require('config');
const jwt = require('jsonwebtoken');
const authenticationErrorMessage = require('../responses/authentication-error');

const devConfig = config.get('DEVELOPER');

module.exports = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token === devConfig.KEY) {
        next();
    } else {
        return res.status(401).json(authenticationErrorMessage());
    }
};