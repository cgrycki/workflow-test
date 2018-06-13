/**
 * Event Utility Functions
 * A collection of helper functions to be used as middleware in our /events api.
 */

/* Dependencies -------------------------------------------------------------*/
const { check }  = require('express-validator/check');
const request    = require('request');
const EventModel = require('../models/index');


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



/* REST utils ---------------------------------------------------------------*/






// POST - create
// validate + sanitize
// Create workflow package:: add response's packageID added to request
// Save event to database::

exports.validParamTextField = validParamTextField;
exports.validParamUserEmail = validParamUserEmail;
exports.validParamId = validParamId;