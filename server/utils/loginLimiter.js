// loginLimiter.js
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 perc
    max: 5, // max 5 kérés / IP / 5 perc
    message: "Túl sok bejelentkezési próbálkozás. Próbáld újra 5 perc múlva.",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = loginLimiter;
