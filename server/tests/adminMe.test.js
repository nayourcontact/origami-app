process.env.ENCRYPTION_SECRET ||= 'c'.repeat(64);
process.env.EMAIL_ENCRYPTION_IV ||= 'd'.repeat(32);
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const adminRoutes = require('../routes/adminRoutes');
const { COOKIE } = require('../utils/adminSession');

test('GET /api/admin/me is a minimal admin-only authentication DTO', async () => {
    const original = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'm'.repeat(64);
    const app = express();
    app.use('/api/admin', adminRoutes);
    const server = app.listen(0, '127.0.0.1');
    try {
        await new Promise(resolve => server.once('listening', resolve));
        const url = `http://127.0.0.1:${server.address().port}/api/admin/me`;
        const admin = jwt.sign({id: 'abc', role: 'admin'}, process.env.JWT_SECRET, {expiresIn: '2h'});
        const visitor = jwt.sign({id: 'visitor', role: 'viewer'}, process.env.JWT_SECRET, {expiresIn: '2h'});
        const fetchWithCookie = value => fetch(url, {headers: value ? {Cookie: `${COOKIE}=${value}`} : {}});
        const anonymous = await fetchWithCookie(null);
        assert.equal(anonymous.status, 401);
        const unauthorized = await fetchWithCookie(visitor);
        assert.equal(unauthorized.status, 403);
        const success = await fetchWithCookie(admin);
        assert.equal(success.status, 200);
        assert.equal(success.headers.get('cache-control'), 'no-store');
        assert.deepEqual(await success.json(), {authenticated: true, role: 'admin'});
    } finally {
        await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
        if (original === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = original;
    }
});
