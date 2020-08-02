const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const checkDevAuth = require('../middleware/check-dev-auth');

// Response formats
const errorMessage = require('../responses/default-error');
const authenticationErrorMessage = require('../responses/authentication-error');

const saltRounds = 10;

const User = require('../models/user');

const router = express.Router();

const jwtConfig = config.get('JWT');

router.post('/signup', async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const users = await User.find({email: email});

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
            email: email,
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

        const users = await User.find({email: email});

        if (users.length < 1) {
            return res.status(401).json(authenticationErrorMessage());
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
    
        if (match) {
            const token = jwt.sign({
                email: user.email,
                userId: user._id
            },
            jwtConfig.KEY,
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

router.delete('/:userId', checkDevAuth, async (req, res, next) => {
    try {
        // Get team id
        const userId = req.params.userId;

        // Remove user based off id
        const result = await User.deleteOne({_id: userId});

        return res.status(200).json({
            message: `Delete user with id: ${userId}.`,
            result: result
        });
    }catch(err) {
        console.log(err);
        res.status(500).json(errorMessage());
    }
});

module.exports = router;