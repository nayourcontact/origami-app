module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    console.error(`[ERROR] ${err.message}`);
    if (!isProduction) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(isProduction ? {} : { stack: err.stack })
    });
};
