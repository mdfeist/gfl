import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user";

export interface IPlayer {
  playerId: IUser["_id"];
  playsTankForTeam: boolean;
  playsDPSForTeam: boolean;
  playsSupportForTeam: boolean;
}

export interface ITeam extends Document {
  name: string;
  description: string;
  owner: IUser["_id"];
  players: IPlayer[];
}

const TeamSchema: Schema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    name: {
      type: String,
      minlength: 4,
      maxlength: 64,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    players: [
      {
        playerId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          require: true,
        },
        playsTankForTeam: {
          type: Boolean,
          default: false,
        },
        playsDPSForTeam: {
          type: Boolean,
          default: false,
        },
        playsSupportForTeam: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export the model and return your ITeam interface
export default mongoose.model<ITeam>("Team", TeamSchema);
