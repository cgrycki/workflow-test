/**
* Express Server
*/

// Environment variables
require('dotenv').config();

/* Dependencies -------------------------------------------------------------*/
var express      = require('express');
var path         = require('path');
var helmet       = require('helmet');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('./auth/auth.session');
var validator    = require('express-validator');
var logger       = require('morgan');


// App Instance
var app = express();

/* Further App Configurations -----------------------------------------------*/
app.use(helmet());          // Security best practices
app.use(logger('dev'));     // Logging
app.use(cookieParser());    // And cookies
app.use(bodyParser.json({ type: 'application/json' })); // For JSON headers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);           // User Sessions backed by DynamoDB
app.use(validator());       // API Parameter validation

if (process.env.NODE_ENV) {
  // Only use Xray in production environment
  var xray = require('./utils/xray');
  app.use(xray.startTrace);
  app.use(xray.requestTrace);
}


// Authentication check
//app.use('*', require('./auth/auth.utils').requiresLogin);

// Routes
var indexRouter = require('./routes/index');
var eventRouter = require('./events/event.routes');
var roomRouter  = require('./rooms/room.routes');

app.use('/', indexRouter);
app.use('/events', eventRouter);
app.use('/rooms', roomRouter);
app.use('/auth', require('./auth/auth.routes'));

if (process.env.NODE_ENV) {
  app.use(xray.endTrace); // Close Xray
}


module.exports = app;
