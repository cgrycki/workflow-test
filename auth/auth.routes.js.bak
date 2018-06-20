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
  const token = request.session.token;

  if (code) {
    // If user code is present, use it to get a auth token
    let token;

    try {
      token = await authUtils.getTokenFromCode(code, request);
      console.log('After authentication: ', request.session);

      // Token checks out! Send them to the front end
      response.redirect('http://localhost:3000');
    } catch (error) {
      // Error exchanging auth code for token
      response.send(404).json({ message: "Couldn't exchange code for token"});
    }
  } else if (token) { 
    // User is already logged in.
    response.redirect('http://localhost:3000');
  
  } else {
    // Otherwise redirect to login site to attempt to get a new code sent to us
    response.redirect(authUtils.getAuthUrl());
  };
});

/* GET /auth/logout -- Destroys a user's session. */
router.get('/logout', (request, response) => { request.session.destroy() });

module.exports = router;