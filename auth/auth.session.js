/**
 * Authorization via DynamoDB Sessions
 */

// Session database table name
const app_name = process.env.APP_NAME;
const env_type = process.env.EENV;
const table    = 'sessions';
const createTableName = require('../utils').createTableName;

// Session middleware
const session = require('express-session');

// Implement a DynamoDB backed session
var DynamoDBStore = require('connect-dynamodb')({ session: session });

// Options for our DB
const dynamo_options = { table: createTableName(app_name, env_type, table) };

module.exports = session({
  store: new DynamoDBStore(dynamo_options), 
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  resave: true,
  saveUninitialized: false
});