const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /teams'
    });
});

router.get('/:teamID', (req, res, next) => {
    const teamID = req.params.teamID;
    res.status(200).json({
        message: 'Handling GET requests to /teams/:teamID',
        id: teamID
    });
});

module.exports = router;