process.env.ENCRYPTION_SECRET ||= 'c'.repeat(64);
process.env.EMAIL_ENCRYPTION_IV ||= 'd'.repeat(32);
process.env.JWT_SECRET = 'z'.repeat(64);
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const adminRoutes = require('../routes/adminRoutes');
const eventService = require('../services/eventService');
const adminService = require('../services/adminService');
const { COOKIE, csrfForToken } = require('../utils/adminSession');

const secret = 'z'.repeat(64);
const origin = 'http://localhost:5173';

async function withServer(router, fn) {
    const app = express();
    app.use(express.json());
    app.use('/api/admin', router);
    const server = app.listen(0, '127.0.0.1');
    try {
        await new Promise(resolve => server.once('listening', resolve));
        await fn(`http://127.0.0.1:${server.address().port}/api/admin`);
    } finally {
        await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
}

function request(base, path, { method = 'GET', token, csrf, body, withOrigin = true } = {}) {
    const headers = {};
    if (token) headers.Cookie = `${COOKIE}=${token}`;
    if (csrf) headers['X-CSRF-Token'] = csrf;
    if (withOrigin) headers.Origin = origin;
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    return fetch(`${base}${path}`, {method, headers, body: body === undefined ? undefined : JSON.stringify(body)});
}

test('admin login/session/logout integration: HTTP cookie contract and no JWT in JSON', async () => {
    const old = {JWT_SECRET: process.env.JWT_SECRET, CLIENT_ORIGIN: process.env.CLIENT_ORIGIN};
    const original = adminService.findByEmail;
    process.env.JWT_SECRET = secret;
    process.env.CLIENT_ORIGIN = origin;
    adminService.findByEmail = async email => email === 'test@example.com'
        ? {_id: 'admin-id', role: 'admin', comparePassword: async value => value === 'valid-password'} : null;
    try {
        await withServer(adminRoutes, async base => {
            const bad = await request(base, '/login', {method: 'POST', body: {email: 'test@example.com', password: 'wrong-password'}});
            assert.equal(bad.status, 401);
            const blocked = await fetch(`${base}/login`, {method:'POST', headers:{Origin:'https://evil.example','Content-Type':'application/json'}, body:JSON.stringify({email:'test@example.com',password:'valid-password'})});
            assert.equal(blocked.status, 403);
            const login = await request(base, '/login', {method:'POST', body:{email:'test@example.com', password:'valid-password'}});
            assert.equal(login.status, 200);
            const json = await login.json();
            assert.deepEqual(Object.keys(json).sort(), ['csrfToken', 'role']);
            assert.equal(json.role, 'admin');
            const cookieHeader = login.headers.get('set-cookie');
            assert.match(cookieHeader, /HttpOnly/i);
            assert.match(cookieHeader, /SameSite=Lax/i);
            const token = cookieHeader.match(new RegExp(`${COOKIE}=([^;]+)`))?.[1];
            assert.ok(token);
            const me = await request(base, '/me', {token});
            assert.equal(me.status, 200);
            assert.deepEqual(await me.json(), {authenticated:true,role:'admin'});
            const logoutNoCsrf = await request(base, '/logout', {method:'POST',token});
            assert.equal(logoutNoCsrf.status, 403);
            const logout = await request(base, '/logout', {method:'POST', token, csrf: json.csrfToken});
            assert.equal(logout.status, 200);
            assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/i);
            assert.equal((await request(base, '/me')).status, 401);
        });
    } finally {
        adminService.findByEmail = original;
        for (const [key, val] of Object.entries(old)) val === undefined ? delete process.env[key] : process.env[key] = val;
    }
});

test('admin event CRUD HTTP integration: permissions, CSRF, create, read, delete', async () => {
    const old = {JWT_SECRET: process.env.JWT_SECRET, CLIENT_ORIGIN: process.env.CLIENT_ORIGIN};
    process.env.JWT_SECRET = secret;
    process.env.CLIENT_ORIGIN = origin;
    const original = {getAllEvents:eventService.getAllEvents, createEvent:eventService.createEvent, deleteEvent:eventService.deleteEvent};
    const events = [];
    eventService.getAllEvents = async () => [...events];
    eventService.createEvent = async body => {
        const event = {_id:'event-1', title:body.title,location:body.location,eventDate:body.eventDate};
        events.push(event);
        return event;
    };
    eventService.deleteEvent = async id => {
        const idx = events.findIndex(e => e._id === id);
        if (idx !== -1) events.splice(idx, 1);
    };
    try {
        await withServer(adminRoutes, async base => {
            const admin = jwt.sign({id:'a',role:'admin'},secret,{expiresIn:'2h'});
            const viewer = jwt.sign({id:'v',role:'viewer'},secret,{expiresIn:'2h'});
            const content = {title:'Test Event',location:'Test location',eventDate:'2026-11-30'};
            assert.equal((await request(base,'/events',{method:'POST',body:content})).status,401);
            assert.equal((await request(base,'/events',{method:'POST',token:viewer,csrf:csrfForToken(viewer),body:content})).status,403);
            assert.equal((await request(base,'/events',{method:'POST',token:admin,body:content})).status,403);
            const create = await request(base,'/events',{method:'POST',token:admin,csrf:csrfForToken(admin),body:content});
            assert.equal(create.status,201);
            assert.equal((await create.json()).title,content.title);
            const list = await request(base,'/events',{token:admin});
            assert.equal(list.status,200);
            assert.equal((await list.json()).length,1);
            assert.equal((await request(base,'/events/event-1',{method:'DELETE',token:admin})).status,403);
            assert.equal((await request(base,'/events/event-1',{method:'DELETE',token:admin,csrf:csrfForToken(admin)})).status,200);
            assert.deepEqual(await (await request(base,'/events',{token:admin})).json(),[]);
        });
    } finally {
        Object.assign(eventService,original);
        for (const [key,val] of Object.entries(old)) val === undefined ? delete process.env[key] : process.env[key] = val;
    }
});
