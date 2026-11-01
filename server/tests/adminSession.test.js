const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const auth = require('../utils/authMiddleware');
const { COOKIE, csrfForToken, trustedOrigin } = require('../utils/adminSession');

const secret = 'b'.repeat(64);
function request(method, session, csrf, origin) {
    const headers = {cookie: `${COOKIE}=${session}`};
    if (csrf) headers['x-csrf-token'] = csrf;
    if (origin) headers.origin = origin;
    return {
        method, headers,
        get(name) { return headers[name.toLowerCase()]; }
    };
}
function invoke(req) {
    let result;
    auth(req, {status(n) { result = { status: n }; return {json(body) {result.body = body; return result; }}; }}, () => { result = {status: 200, user: req.user}; });
    return result;
}
test('JWT cookie authenticated, CSRF checked on mutations', () => {
    const previous = {JWT_SECRET: process.env.JWT_SECRET, CLIENT_ORIGIN: process.env.CLIENT_ORIGIN};
    process.env.JWT_SECRET = secret;
    process.env.CLIENT_ORIGIN = 'http://localhost:5173';
    try {
        const token = jwt.sign({id:'abc',role:'admin'},secret,{expiresIn:'2h'});
        assert.equal(invoke(request('GET', token)).status, 200);
        assert.equal(invoke(request('POST', token)).status, 403);
        assert.equal(invoke(request('POST', token, '0'.repeat(64))).status, 403);
        assert.equal(invoke(request('POST', token, csrfForToken(token), 'https://evil.example')).status, 403);
        assert.equal(invoke(request('POST', token, csrfForToken(token), 'http://localhost:5173')).status, 200);
        assert.equal(invoke(request('GET', 'invalid')).status, 401);
        assert.equal(trustedOrigin({get:()=> 'https://evil.example'}), false);
    } finally {
        for (const key of Object.keys(previous)) {
            if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
        }
    }
});
