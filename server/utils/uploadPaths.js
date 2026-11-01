const path = require('path');
const os = require('os');

// Override for CI and isolated tests; production defaults stay unchanged.
const BASE_UPLOAD_ROOT = process.env.UPLOAD_ROOT
    ? path.resolve(process.env.UPLOAD_ROOT)
    : process.env.NODE_ENV === 'test'
        ? path.join(os.tmpdir(), 'origami-app-test-uploads')
        : process.platform === 'win32'
            ? 'C:/origami_app/uploads'
            : '/home/app/origami_app/uploads';

module.exports = { BASE_UPLOAD_ROOT };
