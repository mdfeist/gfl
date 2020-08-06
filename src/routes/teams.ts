import express from "express";
import mongoose from "mongoose";
import * as getURL from "../helpers/get-url";
import checkAuth from "../middleware/check-auth";
import { Response } from "../responses/response";
import errorMessage from "../responses/default-error";

import User from "../models/user";
import Team, { IPlayer } from "../models/team";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    // TODO: Mongoose paginate
    const teams = await Team.find().select("name _id");
    const teamsPartial = teams.map((team) => {
      return {
        id: team._id,
        name: team.name,
        request: {
          type: "GET",
          description: "Get team info.",
          url: `${getURL.getFull()}/teams/${team._id}`,
        },
      };
    });

    const response: Response = {
      data: {
        currentItemCount: teams.length,
        kind: "team",
        fields: "name,request,id",
        items: teamsPartial,
      },
    };

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(errorMessage());
  }
});

router.post("/", checkAuth, async (req, res, next) => {
  try {
    // Create new team
    const team = new Team({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.teamName,
      owner: res.locals.userData.userId,
    });

    // Save team
    const savedTeam = await team.save();

    const response: Response = {
      data: {
        currentItemCount: 1,
        kind: "team",
        fields: "name,request,id",
        items: [
          {
            _id: savedTeam._id,
            name: savedTeam.name,
            request: {
              type: "GET",
              description: "Get team.",
              url: `${getURL.getFull()}/teams/${savedTeam._id}`,
            },
          },
        ],
      },
    };

    // Return team
    return res.status(201).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(errorMessage());
  }
});

router.get("/:teamId", async (req, res, next) => {
  try {
    // Get team id
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);

    let response: Response;

    // If team not found
    if (!team) {
      response = errorMessage(404, `No valid team found for id: ${teamId}.`);

      return res.status(404).json(response);
    }

    response = {
      data: {
        currentItemCount: 1,
        kind: "team",
        items: [team],
      },
    };

    // Return team
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(errorMessage());
  }
});

router.patch("/:teamId", checkAuth, async (req, res, next) => {
  try {
    // Get team id
    const teamId = req.params.teamId;

    // Check if user can edit
    if (res.locals.userData.type != "admin") {
      let teamOwner = await Team.findById(teamId);
      if (teamOwner.owner != res.locals.userData.userId) {
        return res.status(403).json(errorMessage(403, "Permission denied."));
      }
    }

    const updateOps: Record<string, string> = {};

    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }

    // Update team by id
    let mongoResults = await Team.updateOne(
      { _id: teamId },
      { $set: updateOps }
    );

    const response: Response = {
      data: {
        currentItemCount: 1,
        kind: "results",
        items: [mongoResults],
      },
    };

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(errorMessage());
  }
});

router.delete("/:teamId", checkAuth, async (req, res, next) => {
  try {
    // Get team id
    const teamId = req.params.teamId;

    // Check if user can delete
    if (res.locals.userData.type != "admin") {
      let teamOwner = await Team.findById(teamId);
      if (teamOwner.owner != res.locals.userData.userId) {
        return res.status(403).json(errorMessage(403, "Permission denied."));
      }
    }

    // Remove team by id
    const result = await Team.deleteOne({ _id: teamId });

    const item = {
      message: `Delete called for team with id: ${teamId}`,
      result,
      request: {
        type: "GET",
        description: "Get all teams.",
        url: `${getURL.getFull()}/teams`,
      },
    };

    const response: Response = {
      data: {
        currentItemCount: 1,
        kind: "message",
        items: [item],
      },
    };

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json(errorMessage());
  }
});

router.get("/:teamId/players", async (req, res, next) => {
  try {
    // Get team id
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);

    let response: Response;

    // If team not found
    if (!team) {
      response = errorMessage(404, `No valid team found for id: ${teamId}.`);

      return res.status(404).json(response);
    }

    const players = await Promise.all(
      team.players.map(async (player) => {
        let user = await User.findOne({ _id: player.playerId });
        return {
          id: player.playerId,
          username: user.username,
          tag: user.tag,
          nickname: user.nickname,
          bnet: user.bnet,
          tankSR: user.tankSR,
          dpsSR: user.dpsSR,
          supportSR: user.supportSR,
          playsTankForTeam: player.playsTankForTeam,
          playsDPSForTeam: player.playsDPSForTeam,
          playsSupportForTeam: player.playsSupportForTeam,
          request: {
            type: "GET",
            description: "Get user info.",
            url: `${getURL.getFull()}/users/${player.playerId}`,
          },
        };
      })
    );

    response = {
      data: {
        currentItemCount: players.length,
        kind: "user",
        items: players,
      },
    };

    // Return players
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(errorMessage());
  }
});

router.post("/:teamId/players", checkAuth, async (req, res, next) => {
  try {
    // Get team id
    const teamId = req.params.teamId;
    const playerId = req.body.playerId;

    let team = await Team.findById(teamId);

    let response: Response;

    // If team not found
    if (!team) {
      response = errorMessage(404, `No valid team found for id: ${teamId}.`);

      return res.status(404).json(response);
    }

    // Check if user can add player
    if (res.locals.userData.type != "admin") {
      if (team.owner != res.locals.userData.userId) {
        return res.status(403).json(errorMessage(403, "Permission denied."));
      }
    }

    const player: IPlayer = {
      playerId: playerId,
      playsTankForTeam: req.body.playsTankForTeam,
      playsDPSForTeam: req.body.playsDPSForTeam,
      playsSupportForTeam: req.body.playsSupportForTeam,
    };

    team.players.push(player);
    await team.save();

    response = {
      data: {
        currentItemCount: 1,
        kind: "player",
        items: [player],
      },
    };

    // Return player
    return res.status(201).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json(errorMessage());
  }
});

router.delete(
  "/:teamId/players/:playerId",
  checkAuth,
  async (req, res, next) => {
    try {
      // Get team id
      const teamId = req.params.teamId;
      const playerId = req.params.playerId;

      let team = await Team.findById(teamId);

      let response: Response;

      // If team not found
      if (!team) {
        response = errorMessage(404, `No valid team found for id: ${teamId}.`);

        return res.status(404).json(response);
      }

      // Check if user can add player
      if (res.locals.userData.type != "admin") {
        if (team.owner != res.locals.userData.userId) {
          return res.status(403).json(errorMessage(403, "Permission denied."));
        }
      }

      let removeIndex = team.players
        .map((player) => player.playerId)
        .indexOf(playerId);

      team.players.splice(removeIndex, 1);
      team = await team.save();

      response = {
        data: {
          currentItemCount: 1,
          kind: "team",
          items: [team],
        },
      };

      // Return player
      return res.status(201).json(response);
    } catch (err) {
      console.log(err);
      return res.status(500).json(errorMessage());
    }
  }
);

export default router;
