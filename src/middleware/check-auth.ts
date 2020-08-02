import express from 'express';
import config from 'config';
import jwt from 'jsonwebtoken';
import authenticationErrorMessage from '../responses/authentication-error';

import {JWT} from '../config/config';
const jwtConfig = config.get<JWT>('jwt');

export default (
    req : express.Request,
    res : express.Response,
    next : express.NextFunction) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtConfig.key, null);
        res.locals.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json(authenticationErrorMessage());
    }
};