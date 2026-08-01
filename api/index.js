/* Vercel serverless entrypoint. server.js only calls listen() when run directly,
   so requiring it here hands Vercel the Express app as the request handler. */
module.exports = require('../server.js');
