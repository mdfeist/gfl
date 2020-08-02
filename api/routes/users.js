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

const serverConfig = config.get('SERVER');
const jwtConfig = config.get('JWT');

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                res.statusCode = 409;

                const response = errorMessage(
                    409,
                    'unable to create user as email already exists'
                );

                return res.json(response);
            } else {
                bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json(errorMessage());
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: 'user created',
                                    userId: user._id
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json(errorMessage());
                            });
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(errorMessage());
        });
});

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json(authenticationErrorMessage());
            } else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if (err) {
                        return res.status(401).json(authenticationErrorMessage());
                    }

                    if (result) {
                        const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        jwtConfig.KEY,
                        {
                            expiresIn: "1h"
                        });

                        return res.status(200).json({
                            message: 'authentication successful',
                            jwt_token: token
                        });
                    } else {
                        return res.status(401).json(authenticationErrorMessage());
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(errorMessage());
        });
});

router.delete('/:userId', checkDevAuth, (req, res, next) => {
    // Get team id
    const userId = req.params.userId;

    // Remove user based off id
    User.deleteOne({_id: userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: `Delete user with id: ${userId}`,
                result: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(errorMessage());
        });
});

module.exports = router;