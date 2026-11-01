"use strict";
function log(level, message, fields = {}) {
    const safe = Object.fromEntries(Object.entries(fields).filter(([k]) => !/secret|token|password|authorization|cookie|uri/i.test(k)));
    process.stdout.write(JSON.stringify({ts: new Date().toISOString(), level, message, ...safe}) + '\n');
}
module.exports = {info: (msg, meta) => log('info', msg, meta), warn: (msg, meta) => log('warn', msg, meta), error: (msg, meta) => log('error', msg, meta)};
