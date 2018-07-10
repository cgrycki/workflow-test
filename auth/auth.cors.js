/**
 * Custom CORS
 */

// List of domains we will accept
const whitelist_domains = [process.env.REDIRECT_URI, process.env.FRONTEND_URI, 'uiowa.edu'];

// List of Headers we will accept
const whitelist_headers = [
  'Authorization', 'Content-Type', 'Content-type', 'x-api-key',
  'Origin', 'origin', 'X-Amz-Date', 'X-Requested-With', 'x-requested-with', 
  'Access-Control-Request-Headers', 'Access-Control-Request-Method', 
  'Access-Control-Request-Origin', 'Access-Control-Request-Credentials',
  'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials',
  'access-control-allow-origin', 'access-control-allow-credentials',
  'Cache-Control', 'cache-control'
];

// Whitelist of HTTP Methods
const whitelist_methods = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';

// CORS options for npm's CORS
const cors_options = {
  origin        : whitelist_domains,
  credentials   : true,
  methods       : whitelist_methods,
  allowedHeaders: whitelist_headers
};

/**
 * 
 * @param {object} request Incoming HTTP request object.
 * @param {object} response Outgoing HTTP Response object.
 * @param {function} next Next function in our server's middleware
 */
const customCors = (request, response, next) => {
  // Check to see if the request is coming from a domain in our whitelist
  if ((whitelist_domains.indexOf(request.header('Origin')) !== -1) ||
      (!request.header('Origin'))) {

    // Allow client's and set credentials to true
    response.header('Access-Control-Allow-Origin', request.header('Origin'));
    response.header('Access-Control-Allow-Credentials', true);

    // Allow the following HTTP Methods and headers
    response.header('Access-Control-Allow-Methods', whitelist_methods);
    response.header('Access-Control-Allow-Headers', whitelist_headers);

    // From: https://serverfault.com/questions/856904/chrome-s3-cloudfront-no-access-control-allow-origin-header-on-initial-xhr-req
    if (!request.header('vary')) response.header('vary', 'Origin');
    
    // Send the head back if this is an options preflight request
    if (request.method === 'OPTIONS') response.status(204).end();
    else next();
  }
  // The request is not coming from our whitelist. 
  else {
    response.status(502).json({ 
      err: 'Not allowed from this domain.',
      headers: request.headers
    });
  }
};

exports.whitelist_domains = whitelist_domains;
exports.whitelist_headers = whitelist_headers;
exports.cors_options      = cors_options;
exports.customCors        = customCors;
