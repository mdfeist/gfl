import config from "config";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";

import * as getURL from "./helpers/get-url";
import errorMessage from "./responses/default-error";

import { Server, MongoDB } from "./config/config";

const app = express();
const serverConfig = config.get<Server>("server");
const port = serverConfig.port || 3000;

// Connect to MongoDB
const dbConfig = config.get<MongoDB>("mongo_db");
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.connect(dbConfig.url);

// Middleware
app.use(morgan("dev")); // Logging
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Used to parse JSON bodies

// Handle CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});

// Routes
import userRoutes from "./routes/users";
import teamRoutes from "./routes/teams";

// Handle Routes
app.use(`/${getURL.getRelative()}/users`, userRoutes);
app.use(`/${getURL.getRelative()}/teams`, teamRoutes);

// Error Handling
class ErrorStatus extends Error {
  status: number;
}

app.use((req, res, next) => {
  const error = new ErrorStatus("Not Found.");
  error.status = 404;
  next(error);
});

app.use(
  (
    error: ErrorStatus,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const errorCode = error.status || 500;
    res.status(errorCode);
    res.json(errorMessage(errorCode, error.message));
  }
);

app.listen(port, () =>
  console.log(`GFL app listening at ${serverConfig.url}:${port}`)
);
