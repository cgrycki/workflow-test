var express   = require('express');
var router    = express.Router();
var authUtils = require('../auth/auth.utils');

/* GET home page. */
router.get('/', function(req, res, next) {
  /* Check if we have authenticated the user before
  const accessToken = req.cookies.graph_access_token;
  const userName = req.cookies.uiowa_user_name;

  if (accessToken) {
    // Request is authenticated
    res.redirect('http://localhost:3000');
  } else {
    res.redirect(authUtils.getAuthUrl());
  }*/

  res.redirect('http://localhost:3000');
});

module.exports = router;
