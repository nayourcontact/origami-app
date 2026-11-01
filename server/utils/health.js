"use strict";
const mongoose = require('mongoose');
let draining = false;
function setDraining(value) { draining = Boolean(value); }
function liveness(req, res) { res.set('Cache-Control', 'no-store').status(200).json({status:'alive'}); }
function readiness(req, res) {
    const ready = !draining && mongoose.connection.readyState === 1;
    res.set('Cache-Control','no-store').status(ready ? 200 : 503).json({status:ready ? 'ready':'unavailable'});
}
module.exports = { liveness, readiness, setDraining };
