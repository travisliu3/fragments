const auth = require('http-auth');
// const passport = require('passport');
const authPassport = require('http-auth-passport');

// We'll use our authorize middle module
const authorize = require('./auth-middleware');

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

module.exports.strategy = () =>
  // For our Passport authentication strategy, we'll look for a
  // username/password pair in the Authorization header.
  authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );

// Now we'll delegate the authorization to our authorize middleware
module.exports.authenticate = () => authorize('http');
