import express from 'express';
import config from 'config';
import authenticationErrorMessage from '../responses/authentication-error';

import {Developer} from '../config/config';
const devConfig = config.get<Developer>('developer');

export default (
    req : express.Request,
    res : express.Response,
    next : express.NextFunction) => {
    const token = req.headers.authorization.split(' ')[1];
    if (token === devConfig.key) {
        next();
    } else {
        return res.status(401).json(authenticationErrorMessage());
    }
};