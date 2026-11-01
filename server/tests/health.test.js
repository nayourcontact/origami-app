process.env.ENCRYPTION_SECRET ||= "c".repeat(64);
process.env.EMAIL_ENCRYPTION_IV ||= "d".repeat(32);
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const {setDraining} = require('../utils/health');
const app = require('../app');
async function get(path) {
    const server = http.createServer(app);
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    try {return await fetch(`http://127.0.0.1:${server.address().port}${path}`)}
    finally {await new Promise(r => server.close(r));}
}
test('liveness returns 200 even without Mongo', async () => {const r=await get('/health/live'); assert.equal(r.status,200); assert.deepEqual(await r.json(), {status:'alive'});});
test('readiness returns 503 when DB disconnected or draining', async () => {
    setDraining(true); try {assert.equal((await get('/health/ready')).status,503);} finally {setDraining(false);}
    if(mongoose.connection.readyState!==1) assert.equal((await get('/health/ready')).status,503);
});
test('config validates port and host', () => {
    const {validateConfig}=require('../utils/config'); const e={JWT_SECRET:'z'.repeat(48),MONGO_URI:'mongodb://localhost/db',CLIENT_ORIGIN:'https://example.com'};
    assert.throws(()=>validateConfig({...e,PORT:'abc'}),/PORT/);
    assert.throws(()=>validateConfig({...e,HOST:'example.com'}),/HOST/);
});
