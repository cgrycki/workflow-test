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

module.exports = EventModel;