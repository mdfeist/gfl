import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {JWT} from '../config/config';

import User from '../models/user';

import checkAuth from '../middleware/check-auth';

// Response formats
import {Response} from '../responses/response';
import errorMessage from '../responses/default-error';
import authenticationErrorMessage from '../responses/authentication-error';

const saltRounds = 10;
const jwtConfig = config.get<JWT>('jwt');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const users = await User.find({email});

        if (users.length >= 1) {
            const response = errorMessage(
                409,
                'Unable to create user as email already exists.'
            );

            return res.status(409).json(response);
        }

        const hash = await bcrypt.hash(password, saltRounds);

        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email,
            password: hash
        });

        const savedUser = await user.save();

        return res.status(201).json({
            message: 'User created.',
            userId: savedUser._id
        });
    } catch(err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const users = await User.find({email});

        if (users.length < 1) {
            return res.status(401).json(authenticationErrorMessage());
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign({
                email: user.email,
                userId: user._id,
                type: user.type
            },
            jwtConfig.key,
            {
                expiresIn: "1h"
            });

            return res.status(200).json({
                message: 'Authentication successful.',
                jwt_token: token
            });
        } else {
            return res.status(401).json(authenticationErrorMessage());
        }
    } catch(err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    }
});

router.patch('/:userId', checkAuth, async (req, res, next) => {
    try {
        // Get user id
        const userId = req.params.userId;

        // Check if user can edit
        if (res.locals.userData.type != 'admin') {
            if (userId != res.locals.userData.userId) {
                return res.status(403).json(errorMessage(403, 'Permission denied.'));
            }
        }

        const updateOps : Record<string, string> = {};

        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }

        // Update user by id
        let user = await User.update({_id: userId}, {$set: updateOps});

        const response : Response = {
            data: {
                kind: "user",
                items: [user]
            }
        };

        return res.status(200).json(response);
    } catch(err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    };
});

router.delete('/:userId', checkAuth, async (req, res, next) => {
    try {
        // Get team id
        const userId = req.params.userId;

        // Check if user can edit
        if (res.locals.userData.type != 'admin') {
            if (userId != res.locals.userData.userId) {
                return res.status(403).json(errorMessage(403, 'Permission denied.'));
            }
        }

        // Remove user by id
        const result = await User.deleteOne({_id: userId});  

        const response : Response = {
            data: {
                kind: "response",
                items: [
                    {
                        message: `Delete called for user with id: ${userId}.`,
                        result: result
                    }
                ]
            }
        };

        return res.status(200).json(response);
    }catch(err) {
        console.log(err);
        res.status(500).json(errorMessage());
    }
});

export default router;