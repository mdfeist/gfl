const config = require('config');
const jwt = require('jsonwebtoken');
const authenticationErrorMessage = require('../responses/authentication-error');

const jwtConfig = config.get('JWT');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtConfig.KEY, null);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json(authenticationErrorMessage());
    }
};