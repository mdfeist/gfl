import express from 'express';
import mongoose from 'mongoose';
import * as getURL from '../helpers/get-url';
import checkAuth from '../middleware/check-auth';
import {Response} from '../responses/response';
import errorMessage from '../responses/default-error';

import Team from '../models/team';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const teams = await Team.find().select('name _id');
        const teamsPartial = teams.map(team => {
            return {
                id: team._id,
                name: team.name,
                request: {
                    type: 'GET',
                    description: 'Get team info.',
                    url: `${getURL.getFull()}/teams/${team._id}`
                }
            }
        });

        const response : Response = {
            data: {
                currentItemCount: teams.length,
                kind: "team",
                fields: "name,request,id",
                items: teamsPartial
            }
        };

        return res.status(200).json(response);

    } catch (err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    }
});

router.post('/', checkAuth, async (req, res, next) => {
    try {
        // Create new team
        const team = new Team({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.teamName,
            createdBy: res.locals.userData.userId
        });

        // Save team
        const savedTeam = await team.save();

        const response : Response = {
            data: {
                kind: "team",
                fields: "name,request,id",
                items: [
                    {
                        _id: savedTeam._id,
                        name: savedTeam.name,
                        request: {
                            type: 'GET',
                            description: 'Get team.',
                            url: `${getURL.getFull()}/teams/${savedTeam._id}`
                        }
                    }
                ]
            }
        };

        // Return team
        return res.status(201).json(response);
    } catch(err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    }
});

router.get('/:teamId', async (req, res, next) => {
    try {
        // Get team id
        const teamId = req.params.teamId;

        const team = await Team.findById(teamId);

        let response : Response;

        // If team not found
        if (!team) {
            response = errorMessage(
                404,
                `No valid team found for id: ${teamId}.`
            );

            return res.status(404).json(response);
        }

        response = {
            data: {
                kind: "team",
                items: [team]
            }
        };

        // Return team
        return res.status(201).json(response);
    } catch(err) {
        console.log(err);
        return res.status(500).json(errorMessage());
    }
});

router.patch('/:teamId', checkAuth, (req, res, next) => {
    // Get team id
    const teamId = req.params.teamId;

    return res.status(500).json(errorMessage());
    /*
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
                    url: `${getURL.getFull()}/teams/${teamId}`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(errorMessage());
        });
    */
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
                result,
                request: {
                    type: 'GET',
                    description: 'Get all teams',
                    url: `${getURL.getFull()}/teams`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(errorMessage());
        });
});

export default router;