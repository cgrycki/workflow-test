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
// GET /auth -- Redirects to our login URL
//router.get('/', (req, resp) => resp.redirect(utils.getAuthURL()));

// GET /auth/:code -- Authenticates code sent from Campus Login tools
//   [ validateParams, utils.authenticateCode ],
router.get('/', utils.authenticateCode, 
  (request, response) => response.status(200).redirect(process.env.FRONTEND_URI));

// GET /auth/logout -- Ends a user's session and redirects them to the login URL.
router.get('/logout', utils.clearTokensFromSession, (request, response) => { 
  response.status(200).redirect(process.env.REDIRECT_URI);
});


module.exports = router;