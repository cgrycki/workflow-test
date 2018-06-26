/**
 * Event Utility Functions
 * A collection of helper functions to be used as middleware in our /events api.
 */

/* Dependencies -------------------------------------------------------------*/
const { check } = require('express-validator/check');
const request   = require('request');
const rp        = require('request-promise');


/* Parameter Utils ----------------------------------------------------------*/
/**
 * textField Validation.
 * @param {string} value The textField value passed to our api.
 * @returns {boolean} 
 */
const validParamTextField = check('textField')
  .exists()
  .isString()
  .isLength({min: 1, max: 50})
  .trim()
  .escape();

/**
 * User Email validation.
 */
const validParamUserEmail = check('userEmail')
  .exists()         // Required
  .isString()       // Formatted correctly
  .isEmail()        // Follows email regex.
  .withMessage('You must have a valid email')
  .trim()           // Remove whitespace
  .normalizeEmail(); // Normalize

/**
 * Validate Event id.
 */
const validParamId = check('id')
  .exists()
  .withMessage('You must include a valid ID')
  .isUUID()
  .escape();


/* Middleware utils ---------------------------------------------------------*/
/**
 * Submits a GET request to workflow for a specified package.
 * Endpoint takes the format: GET /workflow/{env}/api/developer/forms/{form_id}/packages/{package_id}/entry
 */
const getWorkflowEvent = (request, response, next) => {
  let endpoint = process.env.EENV + '/api/developer/forms/' +
    process.env.FORM_ID + '/packages/' + request.params.id +
    'entry';

  // Options from https://workflow.uiowa.edu/help/article/62/7
  let options = {
    method: 'GET',
    uri: '',
    headers: {
      Accept: 'application/vnd.workflow+json;version=1.1',
      Authorization: 'Bearer ' + request.USER_ACCESS_TOKEN,
      'X-Client-Remote-Addr': request.ip
    }
  };
}

/**
 * Submits a workflow routing package.
 * POST submission takes the form of: POST /workflow/{env}/api/developer/forms/{form_id}/packages
 */
const postWorkflowEvent = (request, response, next) => {
  let endpoint = '/workflow/' + process.env.EENV + '/api/developer/forms/' +
    process.env.FORM_ID + '/packages'

  // Options for our POST request from https://workflow.uiowa.edu/help/article/62/7
  var options = {
    method: 'POST',
    uri: 'https://apps.its.uiowa.edu' + endpoint,
    headers: {
      Accept: 'application/vnd.workflow+json;version=1.1',
      Authorization: 'Bearer ' + request.session.USER_ACCESS_TOKEN,
      'X-Client-Remote-Addr': request.ip
    },
    body: {
      // REQUIRED by workflow
      state: 'PRE_ROUTING',
      subType: null,
      emailContent: null,
      // Form data, all fields REQUIRED or null
      entry: {
        textField: request.params.textField,
        userEmail: request.params.userEmail
      }
    },
    json: true
  };

  rp(options)
    .then(function (parsedBody) {
        // POST succeeded, pass on the packageId from the response to our save events middleware
        let packageId = parsedBody.actions.packageId;
        request.packageId = packageId;
        next();
    })
    .catch(function (err) {
        // POST failed...
        response.status(422).json({ err: err, stack: err.stack });
    });
};



// POST - create
// validate + sanitize
// Create workflow package:: add response's packageID added to request
// Save event to database::

exports.validParamTextField = validParamTextField;
exports.validParamUserEmail = validParamUserEmail;
exports.validParamId = validParamId;