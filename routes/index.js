var proxy     = require('express-http-proxy');
var http      = require('http');
var rp        = require('request-promise');
var express   = require('express');
var router    = express.Router();
var url       = require('url');
var authUtils = require('../auth/auth.utils');

/**
 *  GET home page. Behavior is as follows:
 *  - If we find an access token in the session => valid, send to frontend
 *  - If theres no token, check for a code => valid, send to /auth to authenticate
 *  - Otherwise no code/access_token => invalid, still send to /auth to redirect
 */
router.get('/', function(req, res) {
  // Gather authentication information
  //req.session.reload();cross domain cookies session
  const accessToken = req.session.uiowa_access_token;
  const code = req.params.code;

  // If the user has an access token, we've already authenticated them
  if (accessToken) {
    //res.status(302).redirect(process.env.FRONTEND_URI);

    // Request promise
    //req.pipe(rp(process.env.FRONTEND_URI)).pipe(res);

    // Proxy server
    proxy(process.env.FRONTEND_URI);

    // HTTP get
    //http.get(process.env.FRONTEND_URI, (proxyRes) => proxyRes.pipe(res));
  }

  // Otherwise send them to auth. If the request contains a code it will
  // be validated by our auth route. If it doesn't it will send them to login
  res.redirect(url.format({
    pathname:"/auth",
    query: req.query
  }));


});

module.exports = router;
