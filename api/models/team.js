const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { 
        type: String,
        require: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    players: [{
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        playsTankForTeam: {
            type: Boolean,
            default: false
        },
        playsDPSForTeam: {
            type: Boolean,
            default: false
        },
        playsSupportForTeam: {
            type: Boolean,
            default: false
        }
    }]
});

module.exports = mongoose.model('Team', teamSchema);