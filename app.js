const config = require('config');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const get_url = require('./api/helpers/get-url');
const errorMessage = require('./api/responses/default-error');

const app = express();
const serverConfig = config.get('SERVER');
const port = serverConfig.PORT || 3000;

// Connect to MongoDB
const dbConfig = config.get('MONGO_DB');
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(dbConfig.URL);

// Middleware
app.use(morgan('dev')); // Logging
app.use(express.urlencoded({extended: false}));
app.use(express.json()); //Used to parse JSON bodies

// Handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

// Routes
const userRoutes = require('./api/routes/users');
const teamRoutes = require('./api/routes/teams');

// Handle Routes
app.use(`/${get_url.getRelative()}/users`, userRoutes);
app.use(`/${get_url.getRelative()}/teams`, teamRoutes);

// Error Handling
app.use((req, res, next) => {
    const error = new Error('Not Found.');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const errorCode = error.status || 500;
    res.status(errorCode);
    res.json(errorMessage(errorCode, error.message));
});

app.listen(port, () => console.log(`GFL app listening at ${serverConfig.URL}:${port}`));