'use strict';

function validateConfig(env = process.env) {
    const required = ['JWT_SECRET', 'MONGO_URI', 'CLIENT_ORIGIN'];
    const missing = required.filter(name => typeof env[name] !== 'string' || !env[name].trim());
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (env.JWT_SECRET.length < 32 || env.JWT_SECRET === 'supersecret') {
        throw new Error('JWT_SECRET must be a non-default value of at least 32 characters');
    }
    if (!/^mongodb(\+srv)?:\/\//.test(env.MONGO_URI)) {
        throw new Error('MONGO_URI must be a MongoDB connection URI');
    }
    let origin;
    try { origin = new URL(env.CLIENT_ORIGIN); } catch { throw new Error('CLIENT_ORIGIN must be a valid URL origin'); }
    if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== env.CLIENT_ORIGIN.replace(/\/$/, '')) {
        throw new Error('CLIENT_ORIGIN must be an http(s) origin without a path');
    }
    return Object.freeze({ jwtSecret: env.JWT_SECRET });
}

module.exports = { validateConfig };
