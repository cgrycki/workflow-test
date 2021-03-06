/**
 * Authentication API endpoints.
 */

/* Dependencies --*/
const express        = require('express');
const router         = express.Router();
const validateParams = require('../utils').validateParams;
const utils          = require('./auth.utils');

/* Parameters ---*/
router.param('code', utils.validParamCode);

/* RESTful endpoints -------*/
// GET /auth/:code -- Authenticates code sent from Campus Login tools
//   [ validateParams, utils.authenticateCode ],
router.get('/', utils.authenticateCode, 
  (request, response) => response.status(200).redirect(process.env.FRONTEND_URI));

// GET /auth/logout -- Ends a user's session and redirects them to the login URL.
router.get('/logout', utils.clearTokensFromSession, (request, response) => {
  // Send them to our entry point to login again
  response.status(200).json({ 'redirect': process.env.REDIRECT_URI });
});

// GET /auth/validate -- Returns a boolean indicating if the user is logged in
router.get('/validate', (request, response) => {
  let session = request.session;
  if (session && session.uiowa_access_token) response.status(200).json({ loggedIn: true });
  else response.status(401).json({ loggedIn: false });
});


module.exports = router;