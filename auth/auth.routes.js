/**
 * Authentication Route
 */

const express   = require('express');
const router    = express.Router();
const authUtils = require('./auth.utils');

/* GET /auth. */
router.get('/', async function(request, response, next) {
  // Get auth code from request
  const code = request.query.code;

  if (code) {
    // If user code is present, use it to get a auth token
    let token;

    console.log('User has code, trying to obtain Access token...');

    try {
      token = await authUtils.getAccessToken(code);
    } catch (error) {
      // Error exchanging auth code for token
      response.send(404).json({ message: "Couldn't exchange code for token"});
    }

    // Token checks out! Send them to the front end
    response.redirect('http://localhost:3000');
    
  } else {
    console.log('Does not have code, redirecting to log in!');

    // Otherwise redirect to login site to attempt to get a new code sent to us
    let redirect_uri = authUtils.getAuthUrl();
    response.redirect(redirect_uri);
  };
});

module.exports = router;