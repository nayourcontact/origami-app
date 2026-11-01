const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const { BASE_UPLOAD_ROOT } = require('./uploadPaths');

const eventDir = path.join(BASE_UPLOAD_ROOT, 'events');
// Never expose a partially uploaded or unvalidated file via express.static.
const stagingDir = path.join(os.tmpdir(), 'origami-upload-staging');
const MAX_SIZE = 50 * 1024 * 1024;
const types = {
    'image/jpeg': { ext: '.jpg', magic: b => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    'image/png': { ext: '.png', magic: b => b.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')) },
    'image/gif': { ext: '.gif', magic: b => ['GIF87a','GIF89a'].includes(b.toString('ascii',0,6)) },
    'image/webp': { ext: '.webp', magic: b => b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP' },
    'video/mp4': { ext: '.mp4', magic: b => b.toString('ascii',4,8)==='ftyp' },
    'video/quicktime': { ext: '.mov', magic: b => b.toString('ascii',4,8)==='ftyp' },
};
const acceptedExt = {'.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.gif':'image/gif', '.webp':'image/webp', '.mp4':'video/mp4', '.mov':'video/quicktime'};

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            try { fs.mkdirSync(stagingDir, {recursive:true, mode:0o700}); cb(null,stagingDir); }
            catch (err) { cb(err); }
        },
        filename: (_req, _file, cb) => cb(null, crypto.randomUUID() + '.tmp')
    }),
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!types[file.mimetype] || acceptedExt[ext] !== file.mimetype) {
            const err = new Error('Nem engedélyezett fájltípus vagy kiterjesztés.');
            err.statusCode = 415;
            return cb(err);
        }
        cb(null, true);
    },
    limits: {fileSize: MAX_SIZE, files:31, fields:30, fieldSize:64*1024, parts:65}
});

async function validateAndPublish(req, res, next) {
    const all = [ ...(req.file ? [req.file] : []), ...(Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat()) ];
    const published = [];
    const staged = all.map(file => file.path);
    try {
        for (const file of all) {
            const fd = await fs.promises.open(file.path, 'r');
            const head = Buffer.alloc(32);
            try { await fd.read(head,0,head.length,0); } finally { await fd.close(); }
            const spec = types[file.mimetype];
            if (!spec || !spec.magic(head)) {
                const err = new Error('A fájl tartalma nem egyezik a megengedett formátummal.');
                err.statusCode = 415;
                throw err;
            }
        }
        // Optional deployment-managed ClamAV scanner. When enabled, any scan error blocks publishing.
        if (process.env.UPLOAD_VIRUS_SCAN === 'clamav') {
            for (const file of all) {
                try { await execFileAsync('clamscan', ['--no-summary', '--', file.path], { timeout:120000 }); }
                catch (_) {
                    const err = new Error('A vírusellenőrzés sikertelen vagy a fájl fertőzött.');
                    err.statusCode = 422;
                    throw err;
                }
            }
        }
        await fs.promises.mkdir(eventDir, {recursive:true});
        for (const file of all) {
            const name = crypto.randomUUID() + types[file.mimetype].ext;
            const destination = path.join(eventDir,name);
            await fs.promises.rename(file.path,destination);
            file.path = destination;
            file.destination = eventDir;
            file.filename = name;
            published.push(destination);
        }
        next();
    } catch(err) {
        await Promise.allSettled(published.map(x => fs.promises.unlink(x)));
        next(err);
    } finally {
        await Promise.allSettled(staged.map(x => fs.promises.unlink(x)));
    }
}

module.exports = { upload, validateAndPublish, types };
