const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('stream');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { downloadInstagramMedia, validateMediaUrl } = require('../services/instagramMediaDownload');
const URL = 'https://scontent.cdninstagram.com/media.jpg';
const jpeg = Buffer.from([0xff,0xd8,0xff,0xdb,1,2,3]);
const fakeRequest = (data, contentType='image/jpeg', headers={}) => async () => ({
    status: 200, headers: { 'content-type': contentType, ...headers }, data: Readable.from([data])
});
test('rejects untrusted URLs and non-HTTPS', () => {
    for (const u of ['http://scontent.cdninstagram.com/a.jpg','https://cdninstagram.com.evil.test/a.jpg','https://127.0.0.1/a.jpg','https://username:password@cdninstagram.com/a.jpg']) {
        assert.throws(() => validateMediaUrl(u));
    }
    assert.ok(validateMediaUrl(URL));
});
test('accepts valid JPEG with a stable public filename', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(),'ig-test-'));
    try {
        const file = await downloadInstagramMedia({ fileUrl:URL, destDir:dir, baseName:'123_media', request:fakeRequest(jpeg) });
        assert.equal(path.basename(file), '123_media.jpg');
        assert.deepEqual(await fs.promises.readFile(file), jpeg);
    } finally { await fs.promises.rm(dir,{recursive:true,force:true}); }
});
test('rejects spoofed content and oversized response', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(),'ig-test-'));
    try {
        await assert.rejects(downloadInstagramMedia({ fileUrl:URL, destDir:dir, baseName:'bad', request:fakeRequest(Buffer.from('<html>')) }), /does not match/);
        await assert.rejects(downloadInstagramMedia({ fileUrl:URL, destDir:dir, baseName:'large', request:fakeRequest(jpeg,'image/jpeg', {'content-length': String(60*1024*1024)}) }), /too large/);
        assert.deepEqual(await fs.promises.readdir(dir), []);
    } finally { await fs.promises.rm(dir,{recursive:true,force:true}); }
});
test('rejects redirects to untrusted domains', async () => {
    const request = async () => ({status:302,headers:{location:'https://evil.test/payload'},data:Readable.from([])});
    await assert.rejects(downloadInstagramMedia({fileUrl:URL,destDir:os.tmpdir(),baseName:'x',request}),/not allowed/);
});
