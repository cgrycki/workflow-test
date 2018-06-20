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
// GET should be authentication callback endpoint
router.get('/', 
  [ validateParams, utils.authenticateCode ],
  (request, response) => response.status(200).redirect('http://localhost:3000'));

// GET /auth/logout -- Ends a user's session and redirects them to the login URL.
router.get('/logout', utils.clearTokensFromSession, (request, response) => { 
  response.status(200).redirect('http://localhost:3001');
});


module.exports = router;