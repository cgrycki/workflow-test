/**
 * Authentication Helpers
 * From: https://docs.microsoft.com/en-us/outlook/rest/node-tutorial
 */


const oauth2_iowa = require('simple-oauth2').create({
  client: {
    id: process.env.UIOWA_ACCESS_KEY_ID,
    secret: process.env.UIOWA_SECRET_ACCESS_KEY,
  },
  auth: {
    tokenHost: 'https://login.uiowa.edu/uip/',
    authorizePath: 'auth.page',
    tokenPath: 'token.page'
  }
});

const oauth2_office = require('simple-oauth2').create({
  client: {
    id: process.env.OFFICE365_ACCESS_KEY,
    secret: process.env.OFFICE365_SECRET_ACCESS_KEY
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
});


/**
 * Return an OAuth2 URL for our application from app's credentials. 
 */
function getAuthUrl() {
  const returnVal = oauth2_iowa.authorizationCode.authorizeURL({
    type: 'web_server',
    response_type: 'code',
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.UIOWA_SCOPES
  });
  return returnVal;
}

/**
 * Preforms the server handshake to authenticate a user with app's credentails.
 * Saves user token to cookie via saveValuesToSession(token, request)
 * @param {string} auth_code OAuth2 authorization code
 * @param {any} response HTTP Response from Express.
 * @returns {string} access_token User auth token
 */
async function getTokenFromCode(auth_code, request) {
  // Get auth token with app/user credentials
  let result = await oauth2_iowa.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.UIOWA_SCOPES
  });

  // Confirm token
  const token = oauth2_iowa.accessToken.create(result);
  //console.log('Token created: ', token.token);

  // Save values to session, so that we may identify user 
  // on subsequent HTTP requests.
  saveValuesToSession(token, request);

  return token.token.access_token;
}

/**
 * Retrieves a cached token, checks expiration, and refreshes if necc.
 * @param {any} cookies 
 * @param {any} request 
 */
async function getAccessToken(cookies, request) {
  // Do we have an access token cached?
  let token = cookies.graph_access_token;

  if (token) {
    // We have a token, but is it expired?
    // Expire 5 minutes early to account for clock differences
    const FIVE_MINUTES = 300000;
    const expiration = new Date(parseFloat(cookies.graph_token_expires - FIVE_MINUTES));
    if (expiration > new Date()) {
      // Token is still good, just return it
      return token;
    }
  }

  // Either no token or it's expired, do we have a 
  // refresh token?
  const refresh_token = cookies.graph_refresh_token;
  if (refresh_token) {
    const newToken = await oauth2_office.accessToken.create({refresh_token: refresh_token}).refresh();
    //saveValuesToCookie(newToken, res);
    saveValuesToSession(newToken, request);

    return newToken.token.access_token;
  }

  // Nothing in the cookies that helps, return empty
  return null;
}


function saveValuesToSession(token, request) {
  // Save the access token to the session
  request.session.uiowa_access_token = token.token.access_token;
  // Save the refresh token to the session
  request.session.uiowa_refresh_token = token.token.refresh_token;
  // Save the token expiration time to the session.
  request.session.uiowa_token_expires = token.token.expires_at.getTime()
  
  
  // Save the user's name to the session. Need to decode from token.token.id_token
  //request.session.graph_user_name = 
}






/* TESTING SESSIONS ---------------------------------------------------------*/



function requiresLogin(request, response, next) {
  if (request.session.token || request.query.code) {
    return next();
  } else {
    //response.status(404).json({ err: 'You must be logged in to view this page.'});
    response.redirect(getAuthUrl());
  }
}



exports.getAuthUrl       = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.getAccessToken   = getAccessToken;
exports.requiresLogin    = requiresLogin;