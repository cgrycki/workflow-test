/**
* DynamoDB Models
*/

var dynamo = require('dynamodb');
var Joi    = require('Joi');

/**
* Events Model
*/
var EventModel = dynamo.define('Event', {
  // Set primary key
  hashKey: 'id',

  // Add timestamp attributes (updatedAt, createdAt)
  timestamps: true,

  schema: {
    id: dynamo.types.uuid(),
    packageId: dynamo.types.uuid().allow(false).default(false),
    userEmail: Joi.string().email().required(),
    textField: Joi.string().min(1).max(50).required(),
    approved: Joi.boolean().default(false)
  },

  tableName: process.env.DYNAMO_TABLE
});


/**
 * Checks to see if a document with a given :Id exists in our DB
 * @param {object} request Express HTTP request.
 * @param {object} response Express HTTP response to act upon.
 * @param {function} next Function after this middleware
 */
EventModel.checkEventMiddleware = function(request, response, next) {
  // Previous middleware has confirmed an :Id param exists.
  let id = request.params.id;

  // Check existence
  EventModel
    .query(id)
    .exec((error, data) => {
      // Return errors
      if (error) return response.status(400).json({ error: JSON.stringify(error) });
      // Not found
      else if (data.Items.length === 0) return response.status(204).json({ error: "Not found"});
      // Exists, next!
      else {
        request.item = data.Items[0];
        next();
      };
    });
} 


/**
 * Router callback function for GET /events. Lists all events in database.
 * @param {object} request Express HTTP request.
 * @param {object} response Express HTTP response to act upon.
 */
EventModel.listEvents = function(request, response) {
  return this
    .scan()
    .exec((error, data) => {
      if (error) return response.status(400).json({ error: JSON.stringify(error) });
      else return response.status(200).json(data.Items);
    });
};

/**
 * Wrapper function for POST /events.
 * @param {object} request Express HTTP request.
 * @param {object} response Express HTTP response to act upon.
 */
EventModel.saveEvent = function(request, response) {
  // Gather params from request.
  let params = request.body;

  return this.create(params, (error, data) => {
    if (error) return response.status(400).json({ error: JSON.stringify(error) });
    else return response.status(201);
  });
};

/**
 * Middleware for POST /events. Uses next so we can stack more middleware after.
 * @param {object} request Express HTTP request.
 * @param {object} response Express HTTP response to act upon.
 * @param {function} next Function after this middleware
 */
EventModel.saveEventMiddleware = function(request, response, next) {
  // Gather params
  let params = request.body;

  // Create an event, returning an error if present otherwise going to the next().
  EventModel.create(params, (error, data) => {
    if (error) return response.status(400).json({ error: JSON.stringify(error) });
    else next();
  });
};



module.exports = EventModel;