module.exports = (code = 500, message = 'Unexpected error.') => {
    return {
        error: {
            code: code,
            message: message
        }
    };
};