module.exports = (code = 500, message = 'Internal error') => {
    return {
        error: {
            code: code,
            message: message
        }
    };
};