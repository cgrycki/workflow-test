/**
 * Authentication Helpers
 * From: https://docs.microsoft.com/en-us/outlook/rest/node-tutorial
 */


const credentials = {
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD,
  },
  auth: {
    tokenHost: 'https://login.uiowa.edu/uip/',
    authorizePath: 'auth.page',
    tokenPath: 'token.page'
  }
};
const oauth2 = require('simple-oauth2').create(credentials);
const jwt = require('jsonwebtoken');

/**
 * Return an OAuth2 URL for our application from app's credentials. 
 */
function getAuthUrl() {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });
  console.log(`Generated auth url: ${returnVal}`);
  return returnVal;
}

/**
 * Preforms the server handshake to authenticate a user with app's credentails.
 * Saves user token to cookie via saveValuesToCookie(token, response)
 * @param {string} auth_code OAuth2 authorization code
 * @param {any} response HTTP Response from Express.
 * @returns {string} access_token User auth token
 */
async function getTokenFromCode(auth_code, response) {
  // Get auth token with app/user credentials
  let result = await oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });

  // Confirm token
  const token = oauth2.accessToken.create(result);
  console.log('Token created: ', token.token);

  // Save values cookie, so that we may identify user 
  // on subsequent HTTP requests.
  saveValuesToCookie(token, response);

  return token.token.access_token;
}

/**
 * Retrieves a cached token, checks expiration, and refreshes if necc.
 * @param {any} cookies 
 * @param {any} res 
 */
async function getAccessToken(cookies, res) {
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
    const newToken = await oauth2.accessToken.create({refresh_token: refresh_token}).refresh();
    saveValuesToCookie(newToken, res);
    return newToken.token.access_token;
  }

  // Nothing in the cookies that helps, return empty
  return null;
}

/**
 * Sets our user's authentication information in a cookie.
 * @param {string} token User OAuth2 token.
 * @param {*} res HTTP Response object
 */
function saveValuesToCookie(token, res) {
  // Parse the identity token
  const user = jwt.decode(token.token.id_token);

  // Save the access token in a cookie
  res.cookie('uiowa_access_token', token.token.access_token, {maxAge: 3600000, httpOnly: true});
  // Save the user's name in a cookie
  res.cookie('uiowa_user_name', user.name, {maxAge: 3600000, httpOnly: true});
  // Save the refresh token in a cookie
  res.cookie('uiowa_refresh_token', token.token.refresh_token, {maxAge: 7200000, httpOnly: true});
  // Save the token expiration tiem in a cookie
  res.cookie('uiowa_token_expires', token.token.expires_at.getTime(), {maxAge: 3600000, httpOnly: true});
}

/**
 * Unsets our saved information.
 * @param {any} res HTTP Response provided by Express.
 */
function clearCookies(res) {
  // Clear cookies
  res.clearCookie('uiowa_access_token', {maxAge: 3600000, httpOnly: true});
  res.clearCookie('uiowa_user_name', {maxAge: 3600000, httpOnly: true});
  res.clearCookie('uiowa_refresh_token', {maxAge: 7200000, httpOnly: true});
  res.clearCookie('uiowa_token_expires', {maxAge: 3600000, httpOnly: true});
}

/**
 * Middleware ensuring our client is authenticated before answering any HTTP calls.
 * @param {any} request HTTP request object
 * @param {any} request HTTP response object
 * @param {function} next Next function execute in our middleware.
 */
//function validateCredentials(request, response, next) {}
//require('dotenv').config();
//console.log(getAuthUrl());

exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.getAccessToken = getAccessToken;
exports.clearCookies = clearCookies;