import mongoose, { Schema, Document } from 'mongoose';
import { BNET_PATTERN } from '../helpers/bnet';

export const EMAIL_PATTERN = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export interface Connection extends Document {
    service: string;
    accountName: string;
    visibleToPublic: boolean;
    visibleToTeam: boolean;
};

export interface User extends Document {
    email: string;
    password: string;
    type: string;
    about: string;
    username: string;
    tag: string;
    nickname: string;
    bnet: string;
    tankSR: number;
    dpsSR: number;
    supportSR: number;
    playsMainTank: boolean;
    playsOffTank: boolean;
    playsProjectileDPS: boolean;
    playsHitscanDPS: boolean;
    playsMainSupport: boolean;
    playsOffSupport: boolean;
    lookingForTeam: boolean;
    connections: Connection[];
}

const UserSchema = new Schema({
    _id: Schema.Types.ObjectId,
    email: {
        type: String,
        require: true,
        unique: true,
        match: EMAIL_PATTERN
    },
    password: {
        type: String,
        require: true
    },
    type: {
        type: String,
        enum : ['user','admin'],
        default: 'user',
        require: true
    },
    about: {
        type: String,
        default: null
    },
    username: {
        type: String,
        require: true
    },
    tag: {
        type: String,
        require: true
    },
    nickname: {
        type: String,
        default: null
    },
    bnet: {
        type: String,
        require: true,
        match: BNET_PATTERN
    },
    tankSR: {
        type: Number,
        get: (v : number) => Math.round(v),
        set: (v : number) => Math.round(v),
        default: 0
    },
    dpsSR: {
        type: Number,
        get: (v : number) => Math.round(v),
        set: (v : number) => Math.round(v),
        default: 0
    },
    supportSR: {
        type: Number,
        get: (v : number) => Math.round(v),
        set: (v : number) => Math.round(v),
        default: 0
    },
    playsMainTank: {
        type: Boolean,
        default: false
    },
    playsOffTank: {
        type: Boolean,
        default: false
    },
    playsProjectileDPS: {
        type: Boolean,
        default: false
    },
    playsHitscanDPS: {
        type: Boolean,
        default: false
    },
    playsMainSupport: {
        type: Boolean,
        default: false
    },
    playsOffSupport: {
        type: Boolean,
        default: false
    },
    lookingForTeam: {
        type: Boolean,
        default: false
    },
    connections: [{
        service: {
            type: String,
            enum : [
                'bnet',
                'discord',
                'other'
            ],
            default: 'other',
            require: true
        },
        accountName: {
            type: String,
            require: true
        },
        visibleToPublic: {
            type: Boolean,
            default: false
        },
        visibleToTeam: {
            type: Boolean,
            default: false
        }
    }]
},
{
    timestamps: true
});

// Export the model and return your IUser interface
export default mongoose.model<User>('User', UserSchema);