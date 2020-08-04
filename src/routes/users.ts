import config from 'config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


import User, { EMAIL_PATTERN } from '../models/user';
import * as getURL from '../helpers/get-url';
import * as bnet from '../helpers/bnet';
import checkAuth from '../middleware/check-auth';
import {JWT} from '../config/config';

// Response formats
import { Response } from '../responses/response';
import errorMessage from '../responses/default-error';
import authenticationErrorMessage from '../responses/authentication-error';

const saltRounds = 10;
const jwtConfig = config.get<JWT>('jwt');

const EMAIL_REGEX = new RegExp(EMAIL_PATTERN);

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Check if email is given
        if (!email) {
            const response = errorMessage(
                409,
                'Unable to create user as no email was given.'
            );

            return res.status(409).json(response);
        }

        // Check if email is valid
        if (!EMAIL_REGEX.test(email)) {
            const response = errorMessage(
                409,
                'Unable to create user as invalid email was given.'
            );

            return res.status(409).json(response);
        }

        // Check if user email exists
        let users = await User.find({email});

        if (users.length >= 1) {
            const response = errorMessage(
                409,
                'Unable to create user as email already exists.'
            );

            return res.status(409).json(response);
        }

        // Check if password is acceptable
        if (!password || password.length < 6) {
            const response = errorMessage(
                409,
                'Unable to create user as password is not acceptable.'
            );

            return res.status(409).json(response);
        }

        // Check valid username
        let username = req.body.username;
        if (!username || username.length < 4) {
            const response = errorMessage(
                409,
                'Unable to create user as username is not acceptable.'
            );

            return res.status(409).json(response);
        }

        // Get unique tag
        let randomTag = '00000';
        let userTagExists = true;
        while (userTagExists) {
            randomTag = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
            userTagExists = await User.exists({username: username, tag: randomTag});
        } 

        // Check valid bnet
        let bnetTag = req.body.bnet;

        if (!bnetTag || !bnet.checkValidBnet(bnetTag)) {
            const response = errorMessage(
                409,
                'Unable to create user as battle net tag is not acceptable.'
            );

            return res.status(409).json(response);
        }

        // Hash password
        const hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: email,
            password: hash,
            username: username,
            tag: randomTag,
            bnet: bnetTag
        });

        // Save user
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

router.get('/:userId', async (req, res, next) => {
    try {
        // Get user id
        const userId = req.params.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(errorMessage(404, 'Unable to find user.'));
        }

        const usersPartial = {
            id: user._id,
            username: user.username,
            tag: user.tag,
            nickname: user.nickname,
            bnet: user.bnet,
            tankSR: user.tankSR,
            dpsSR: user.dpsSR,
            supportSR: user.supportSR,
            playsMainTank: user.playsMainTank,
            playsOffTank: user.playsOffTank,
            playsProjectileDPS: user.playsProjectileDPS,
            playsHitscanDPS: user.playsHitscanDPS,
            playsMainSupport: user.playsMainSupport,
            playsOffSupport: user.playsOffSupport,
            lookingForTeam: user.lookingForTeam
        };

        const fields = Object.keys(usersPartial).toString();

        const response : Response = {
            data: {
                currentItemCount: 1,
                kind: "user",
                fields: fields,
                items: [usersPartial]
            }
        };

        return res.status(200).json(response);
    } catch(err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    };
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
        let user = await User.updateOne({_id: userId}, {$set: updateOps});

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
                kind: "message",
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

router.get('/:userId/sr', async (req, res, next) => {
    try {
        // Get user id
        const userId = req.params.userId;

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json(errorMessage(404, 'Unable to find user.'));
        }

        // Try to update SR
        let updateSR = req.query.update;
        if (updateSR) {
            try {
                let stats = await bnet.getBnetStats(user.bnet);
    
                user.tankSR = parseInt(stats.rank.tank.sr);
                user.dpsSR = parseInt(stats.rank.damage.sr);
                user.supportSR = parseInt(stats.rank.support.sr);
                
                // Save if updated
                user = await user.save();
            } catch (err) {
                console.log(`Error: Unable to update bnet for user ${userId}.`);
                console.log(err);
                return res.status(500).json(errorMessage(500, err));
            }
        }

        const usersPartial = {
            id: user._id,
            username: user.username,
            tag: user.tag,
            bnet: user.bnet,
            tankSR: user.tankSR,
            dpsSR: user.dpsSR,
            supportSR: user.supportSR
        };

        const fields = Object.keys(usersPartial).toString();

        const response : Response = {
            data: {
                currentItemCount: 1,
                kind: "user",
                fields: fields,
                items: [usersPartial]
            }
        };

        return res.status(200).json(response);
    } catch(err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    };
});

export default router;