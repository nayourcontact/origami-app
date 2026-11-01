process.env.ENCRYPTION_SECRET ||= "c".repeat(64);
process.env.EMAIL_ENCRYPTION_IV ||= "d".repeat(32);
process.env.JWT_SECRET = 'z'.repeat(64);
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const { COOKIE, csrfForToken } = require('../utils/adminSession');
const { upload, validateAndPublish } = require('../utils/upload');
const postRoutes = require('../routes/postRoutes');
const adminRoutes = require('../routes/adminRoutes');
const { types } = require('../utils/upload');

async function serverOf(router, path, fn) {
    const app = express();
    app.use(express.json());
    app.use(path, router);
    app.use((err,req,res,next) => res.status(err.statusCode || 500).json({message:err.message}));
    const server = app.listen(0,'127.0.0.1');
    try {
        await new Promise(resolve => server.once('listening',resolve));
        await fn(`http://127.0.0.1:${server.address().port}${path}`);
    } finally { await new Promise(resolve=>server.close(resolve)); }
}
test('public destructive post route requires authenticated admin and CSRF', async () => {
    await serverOf(postRoutes,'/api/posts', async base => {
        assert.equal((await fetch(base+'/all',{method:'DELETE'})).status,401);
        const visitor = jwt.sign({id:'visitor',role:'viewer'},process.env.JWT_SECRET);
        assert.equal((await fetch(base+'/all',{method:'DELETE',headers:{Cookie:`${COOKIE}=${visitor}`, Origin:process.env.CLIENT_ORIGIN,'X-CSRF-Token':csrfForToken(visitor)}})).status,403);
        const admin = jwt.sign({id:'admin',role:'admin'},process.env.JWT_SECRET);
        assert.equal((await fetch(base+'/all',{method:'DELETE',headers:{Cookie:`${COOKIE}=${admin}`,Origin:process.env.CLIENT_ORIGIN}})).status,403);
    });
});
test('admin registration requires authentication before database access', async () => {
    await serverOf(adminRoutes,'/api/admin', async base => {
        assert.equal((await fetch(base+'/register',{method:'POST',headers:{'Content-Type':'application/json',Origin:process.env.CLIENT_ORIGIN},body:JSON.stringify({email:'x@example.com',password:'strong-pass'})})).status,401);
    });
});
test('upload validation rejects spoofed MIME and extension', async () => {
    const app = express();
    app.post('/', upload.single('coverImage'), validateAndPublish, (_req,res)=>res.status(201).end());
    app.use((err,req,res,next)=>res.status(err.statusCode||500).json({message:err.message}));
    const server=app.listen(0,'127.0.0.1');
    try {
        await new Promise(resolve=>server.once('listening',resolve));
        const url=`http://127.0.0.1:${server.address().port}`;
        const f1=new FormData();f1.append('coverImage',new Blob(['bad data'],{type:'image/png'}),'bad.png');
        assert.equal((await fetch(url,{method:'POST',body:f1})).status,415);
        const f2=new FormData();f2.append('coverImage',new Blob(['MZ'],{type:'application/octet-stream'}),'bad.exe');
        assert.equal((await fetch(url,{method:'POST',body:f2})).status,415);
    } finally {await new Promise(resolve=>server.close(resolve));}
});
