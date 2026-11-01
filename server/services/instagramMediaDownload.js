const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_HOSTS = ['cdninstagram.com', 'fbcdn.net'];
const MIME_EXT = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
    'image/gif': '.gif', 'video/mp4': '.mp4', 'video/quicktime': '.mov'
};
function validateMediaUrl(value) {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !ALLOWED_HOSTS.some(domain => host === domain || host.endsWith('.' + domain))) {
        throw new Error('Instagram media URL not allowed');
    }
    return url;
}
function detectType(b) {
    if (b.length >= 3 && b[0] === 255 && b[1] === 216 && b[2] === 255) return 'image/jpeg';
    if (b.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))) return 'image/png';
    if (b.toString('ascii',0,4) === 'RIFF' && b.toString('ascii',8,12) === 'WEBP') return 'image/webp';
    if (['GIF87a','GIF89a'].includes(b.toString('ascii',0,6))) return 'image/gif';
    if (b.toString('ascii',4,8) === 'ftyp') {
        const brand = b.toString('ascii',8,12);
        return ['qt  '].includes(brand) ? 'video/quicktime' : 'video/mp4';
    }
    return null;
}
async function downloadInstagramMedia({ fileUrl, destDir, baseName, request = axios.get }) {
    let current = validateMediaUrl(fileUrl).toString();
    let response;
    for (let i = 0; i <= 3; i++) {
        response = await request(current, {
            responseType: 'stream', timeout: 15000, maxRedirects: 0,
            validateStatus: status => status >= 200 && status < 400,
            headers: { Accept: 'image/*,video/mp4,video/quicktime' }
        });
        if (response.status >= 300) {
            response.data?.destroy?.();
            if (i === 3 || !response.headers.location) throw new Error('Media redirect limit exceeded');
            current = validateMediaUrl(new URL(response.headers.location, current).toString()).toString();
            continue;
        }
        break;
    }
    const mime = String(response.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (!MIME_EXT[mime]) { response.data.destroy(); throw new Error('Unsupported media MIME'); }
    const declared = Number(response.headers['content-length']);
    if (response.headers['content-length'] != null && (!Number.isFinite(declared) || declared > MAX_BYTES || declared < 0)) {
        response.data.destroy(); throw new Error('Media too large');
    }
    const staging = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'origami-instagram-'));
    const staged = path.join(staging, 'media.tmp');
    try {
        let bytes = 0;
        const limiter = new Transform({
            transform(chunk, _encoding, callback) {
                bytes += chunk.length;
                callback(bytes > MAX_BYTES ? new Error('Media too large') : null, chunk);
            }
        });
        await pipeline(response.data, limiter, fs.createWriteStream(staged, { flags: 'wx', mode: 0o600 }));
        const handle = await fs.promises.open(staged, 'r');
        const header = Buffer.alloc(32);
        let read;
        try { ({ bytesRead: read } = await handle.read(header, 0, 32, 0)); }
        finally { await handle.close(); }
        const actual = detectType(header.subarray(0, read));
        if (actual !== mime) throw new Error('Media MIME does not match file content');
        // Malware scanning can be added here later; no scanner is assumed to be installed.
        await fs.promises.mkdir(destDir, { recursive: true });
        const safeName = String(baseName).replace(/[^a-zA-Z0-9_-]/g, '_');
        const target = path.join(destDir, `${safeName}${MIME_EXT[actual]}`);
        const temporaryTarget = path.join(destDir, `.${crypto.randomUUID()}.tmp`);
        try {
            await fs.promises.copyFile(staged, temporaryTarget, fs.constants.COPYFILE_EXCL);
            await fs.promises.rename(temporaryTarget, target);
        } finally { await fs.promises.rm(temporaryTarget, { force: true }); }
        return target;
    } finally {
        response.data?.destroy?.();
        await fs.promises.rm(staging, { recursive: true, force: true });
    }
}
module.exports = { downloadInstagramMedia, validateMediaUrl, detectType, MAX_BYTES };
