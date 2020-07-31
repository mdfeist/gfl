const mongoose = require('mongoose');
const bnet = require('../helpers/bnet');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { 
        type: String, 
        require: true, 
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/  
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
    name: {
        type: String,
        require: true
    },
    tag: {
        type: String,
        require: true
    },
    nickname: {
        type: String
    },
    bnet: {
        type: String,
        require: true,
        match: bnet.BNET_PATTERN
    },
    tankSR: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    dpsSR: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    supportSR: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    playsTank: {
        type: Boolean,
        default: false
    },
    playsDPS: {
        type: Boolean,
        default: false
    },
    playsSupport: {
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
});

module.exports = mongoose.model('User', userSchema);