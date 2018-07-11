/**
* Express Server
*/

// Environment variables
require('dotenv').config();

/* Dependencies -------------------------------------------------------------*/
var express      = require('express');
var path         = require('path');
var cors         = require('cors');
var customCors   = require('./utils/customCors');
var helmet       = require('helmet');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('./auth/auth.session');
var validator    = require('express-validator');
var logger       = require('morgan');


// App Instance
var app = express();

/* Further App Configurations -----------------------------------------------*/
app.use(logger('dev'));     // Logging
app.use(helmet());          // Security best practices

// CORS: Cross origin resource sharing, so we can talk to our frontend
//app.use(custCors.customCors);
app.use(cors(customCors.cors_options));
app.options('*', cors());   // CORS for preflight requests

// Parsing
app.use(cookieParser(process.env.MY_AWS_SECRET_ACCESS_KEY)); // Parse cookies
app.use(bodyParser.json({ type: 'application/json' }));      // applicatin/json parsing
app.use(bodyParser.urlencoded({ extended: true }));          // application/www-url parsing
app.use(validator());                                        // API Parameter validation

app.set('trust proxy', 1);  // Reverse proxy
app.use(session);           // User Sessions backed by DynamoDB

// Only use Xray in production environment
if (process.env.NODE_ENV) {
  var xray = require('./utils/xray');
  app.use(xray.startTrace);
  app.use(xray.requestTrace);
}


// Authentication check
//app.use('*', require('./auth/auth.utils').requiresLogin);

/* ROUTES -------------------------------------------------------------------*/
app.use('/',       require('./routes/index'));
app.use('/events', require('./events/event.routes'));
app.use('/rooms',  require('./rooms/room.routes'));
app.use('/auth',   require('./auth/auth.routes'));

// Error Handling
app.use('*',      require('./utils/errors').handleErrors);

// Close Xray
if (process.env.NODE_ENV) app.use(xray.endTrace);

module.exports = app;