const jwt = require('jsonwebtoken');
const { getSessionToken, validCsrf, trustedOrigin } = require('./adminSession');

module.exports = (req, res, next) => {
    const token = getSessionToken(req);
    if (!token) return res.status(401).json({message: 'Hiányzó munkamenet.'});
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (_) {
        return res.status(401).json({message: 'Érvénytelen vagy lejárt munkamenet.'});
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        if (!trustedOrigin(req) || !validCsrf(req, token)) {
            return res.status(403).json({message: 'Érvénytelen CSRF token vagy Origin.'});
        }
    }
    next();
};
