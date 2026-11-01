const crypto = require('crypto');
const COOKIE = 'origami_admin_session';
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

function parseCookies(header = '') {
    return Object.fromEntries(header.split(';').map(part => {
        const index = part.indexOf('=');
        if (index === -1) return ['', ''];
        return [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }).filter(([name]) => name));
}
function cookieOptions(req) {
    return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api', maxAge: MAX_AGE_MS };
}
function setSessionCookie(req, res, jwt) { res.cookie(COOKIE, jwt, cookieOptions(req)); }
function clearSessionCookie(req, res) { res.clearCookie(COOKIE, cookieOptions(req)); }
function getSessionToken(req) { return parseCookies(req.headers.cookie)[COOKIE]; }
function csrfForToken(jwt) {
    return crypto.createHmac('sha256', process.env.JWT_SECRET).update('csrf:' + jwt).digest('hex');
}
function validCsrf(req, jwt) {
    const supplied = req.get('X-CSRF-Token');
    if (typeof supplied !== 'string' || !/^[a-f0-9]{64}$/.test(supplied)) return false;
    return crypto.timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(csrfForToken(jwt), 'hex'));
}
function trustedOrigin(req) {
    const origin = req.get('Origin');
    // Modern browsers always include Origin for cross-origin and unsafe requests.
    // Missing Origin is allowed only for non-browser clients; they still need the CSRF token.
    return !origin || origin === process.env.CLIENT_ORIGIN;
}
module.exports = { COOKIE, parseCookies, setSessionCookie, clearSessionCookie, getSessionToken, csrfForToken, validCsrf, trustedOrigin };
