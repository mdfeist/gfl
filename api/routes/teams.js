const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Team = require('../models/team');

const router = express.Router();

const serverConfig = config.get('SERVER');

router.get('/', (req, res, next) => {
    Team.find()
        .select('name _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                teams: docs.map(doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        request: {
                            type: 'GET',
                            description: 'Get team with specific id',
                            url: `${serverConfig.URL}:${serverConfig.PORT}/teams/${doc._id}`
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.post('/', checkAuth, (req, res, next) => {
    console.log(req.userData);
    // Create new team
    const team = new Team({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.teamName,
        createdBy: req.userData.userId
    });

    // Save team
    team.save().then(result => {
        // Return team
        res.status(201).json({
            message: 'Team was created',
            team: result,
            request: {
                type: 'GET',
                description: 'Get all teams',
                url: `${serverConfig.URL}:${serverConfig.PORT}/teams`
            }
        });

    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.get('/:teamId', (req, res, next) => {
    // Get team id
    const teamId = req.params.teamId;

    // Find team based off id
    Team.findById(teamId)
        .exec()
        .then(doc => {
            // If team found
            if (doc) {
                res.status(200).json({
                    message: `Return team with id: ${teamId}`,
                    team: doc
                });
            } else {
                res.status(404).json({
                    message: `No valid team found for id: ${teamId}`,
                    id: teamId
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.patch('/:teamId', checkAuth, (req, res, next) => {
    // Get team id
    const teamId = req.params.teamId;

    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    // Update team based off id
    Team.update({_id: teamId}, {$set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                message: `Team ${teamId} has been updated`,
                request: {
                    type: 'GET',
                    description: 'Get updated team',
                    url: `${serverConfig.URL}:${serverConfig.PORT}/teams/${teamId}`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.delete('/:teamId', checkAuth, (req, res, next) => {
    // Get team id
    const teamId = req.params.teamId;

    // Remove team based off id
    Team.deleteOne({_id: teamId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: `Delete team with id: ${teamId}`,
                result: result,
                request: {
                    type: 'GET',
                    description: 'Get all teams',
                    url: `${serverConfig.URL}:${serverConfig.PORT}/teams`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

module.exports = router;