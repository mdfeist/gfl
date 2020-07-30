const express = require('express');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

const teamRoutes = require('./api/routes/teams');

app.use(morgan('dev'));

app.get('/', (req, res) => res.send('Hello World!'));

// Handle Routes
app.use('/teams', teamRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

app.listen(port, () => console.log(`GFL app listening at http://localhost:${port}`));