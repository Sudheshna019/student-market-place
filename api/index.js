// Vercel serverless entry: every /api/* request is routed here (see vercel.json)
// and handled by the same Express app used in local development.
module.exports = require('../server/app');
