var express   = require('express');
var router    = express.Router();
var authUtils = require('../auth/auth.utils');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Check if we have authenticated the user before
  const accessToken = req.cookies.uiowa_access_token;
  const userName = req.cookies.uiowa_user_name;

  if (accessToken && userName) {
    // Request is authenticated
    res.redirect('http://localhost:3000');
  } else {
    let signin_url = authUtils.getAuthUrl();
    res.redirect(signin_url);
  }
});

module.exports = router;
