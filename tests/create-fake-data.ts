import config from "config";
import mongoose, { Mongoose, MongooseDocument } from "mongoose";
import fs from "fs";
import bcrypt from "bcrypt";

import User, { IUser } from "../src/models/user";
import Team, { ITeam } from "../src/models/team";
import { MongoDB } from "../src/config/config";

const saltRounds = 10;
const numberOfUsers = 100;
const numberOfteams = 10;
const srRange = 250;

// Connect to MongoDB
const dbConfig = config.get<MongoDB>("mongo_db");
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.connect(dbConfig.url);

function getRandomElement(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomSR(min = 1000, max = 4500) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomYesNo() {
  return Math.random() > 0.5;
}

async function createUser(names: string[]): Promise<IUser> {
  let username = getRandomElement(names);

  // Get unique tag
  let randomTag = "00000";
  let userTagExists = true;
  while (userTagExists) {
    randomTag = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);
    userTagExists = await User.exists({ username: username, tag: randomTag });
  }

  let bnetTag = `${username}#${randomTag}`.replace("-", "");
  let email = `${username}${randomTag}@test.com`;

  let about = `${username} is a test user. They are not a real person.`;

  // Hash password
  const hash = await bcrypt.hash("password", saltRounds);

  let baseSR = getRandomSR(1500, 4000);
  let minSR = baseSR - srRange;
  let maxSR = baseSR + srRange;
  let tankSR = getRandomSR(minSR, maxSR);
  let dpsSR = getRandomSR(minSR, maxSR);
  let supportSR = getRandomSR(minSR, maxSR);

  let playsMainTank = getRandomYesNo();
  let playsOffTank = getRandomYesNo();
  let playsProjectileDPS = getRandomYesNo();
  let playsHitscanDPS = getRandomYesNo();
  let playsMainSupport = getRandomYesNo();
  let playsOffSupport = getRandomYesNo();
  let lookingForTeam = getRandomYesNo();

  // Create user
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    email: email,
    password: hash,
    username: username,
    tag: randomTag,
    about: about,
    bnet: bnetTag,
    tankSR: tankSR,
    dpsSR: dpsSR,
    supportSR: supportSR,
    playsMainTank: playsMainTank,
    playsOffTank: playsOffTank,
    playsProjectileDPS: playsProjectileDPS,
    playsHitscanDPS: playsHitscanDPS,
    playsMainSupport: playsMainSupport,
    playsOffSupport: playsOffSupport,
    lookingForTeam: lookingForTeam,
  });

  // Save user
  let savedUser = await user.save();
  return savedUser;
}

async function createTeam(
  names: string[],
  users: Record<string, IUser>
): Promise<ITeam> {
  let name = getRandomElement(names);
  let shuffledUsers = Object.values(users).sort(() => Math.random() - 0.5);
  let players = shuffledUsers.slice(0, 6);

  let description = `${name} is a test team.`;

  // Create user
  const team = new Team({
    _id: new mongoose.Types.ObjectId(),
    name: name,
    description: description,
    owner: players[0]._id,
  });

  for (let i = 0; i < players.length; i++) {
    let playsTankForTeam = i <= 1 ? true : false;
    let playsDPSForTeam = i > 1 && i < 4 ? true : false;
    let playsSupportForTeam = i >= 4 ? true : false;
    team.players.push({
      playerId: players[i]._id,
      playsTankForTeam: playsTankForTeam,
      playsDPSForTeam: playsDPSForTeam,
      playsSupportForTeam: playsSupportForTeam,
    });
  }

  // Save team
  let savedTeam = await team.save();
  return savedTeam;
}

async function main() {
  // Get names
  let namesFile = fs.readFileSync("./tests/usernames.txt", "utf-8");
  let names = namesFile.split("\n");
  names = names.filter((name) => name.length > 4);

  let users: Record<string, IUser> = {};
  for (let i = 0; i < numberOfUsers; i++) {
    let user = await createUser(names);
    users[user._id] = user;
    console.log(user);
  }

  let teamNamesFile = fs.readFileSync("./tests/teamnames.txt", "utf-8");
  let teamNames = teamNamesFile.split("\n");

  let teams: Record<string, ITeam> = {};
  for (let i = 0; i < numberOfteams; i++) {
    let team = await createTeam(teamNames, users);
    teams[team._id] = team;
    console.log(team);
  }
}

main()
  .then(() => {
    console.log("Done");
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    process.exit();
  });
