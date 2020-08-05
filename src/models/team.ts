import mongoose, { Schema, Document } from "mongoose";
import { User } from "./user";

export interface Player {
  playerId: User["_id"];
  playsTankForTeam: boolean;
  playsDPSForTeam: boolean;
  playsSupportForTeam: boolean;
}

export interface Team extends Document {
  name: string;
  description: string;
  owner: User["_id"];
  players: Player[];
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
export default mongoose.model<Team>("Team", TeamSchema);
