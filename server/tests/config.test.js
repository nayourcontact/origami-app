const test = require('node:test');
const assert = require('node:assert/strict');
const { validateConfig } = require('../utils/config');
const valid = {JWT_SECRET: 'a'.repeat(64), MONGO_URI: 'mongodb://localhost:27017/mydatabase', CLIENT_ORIGIN: 'https://example.com'};
test('valid production configuration', () => assert.equal(validateConfig(valid).jwtSecret, valid.JWT_SECRET));
test('missing secret fails closed', () => assert.throws(() => validateConfig({...valid, JWT_SECRET: undefined}), /JWT_SECRET/));
test('insecure fallback is rejected', () => assert.throws(() => validateConfig({...valid, JWT_SECRET: 'supersecret'}), /JWT_SECRET/));
test('missing MongoDB connection rejected', () => assert.throws(() => validateConfig({...valid, MONGO_URI: ''}), /MONGO_URI/));
test('invalid client origin rejected', () => assert.throws(() => validateConfig({...valid, CLIENT_ORIGIN: 'https://example.com/path'}), /CLIENT_ORIGIN/));
