module.exports = (code = 500, message = 'unexpected error') => {
    return {
        error: {
            code: code,
            message: message
        }
    };
};