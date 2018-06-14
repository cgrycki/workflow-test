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
var validator    = require('express-validator');
var logger       = require('morgan');


// App Instance
var app = express();

/* Further App Configurations -----------------------------------------------*/
// Security best practices
app.use(helmet());
// Logging
app.use(logger('dev'));
// For JSON headers
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));
// API Parameter validation
app.use(validator());
// And cookies
app.use(cookieParser());


// Routes
var indexRouter = require('./routes/index');
var eventRouter = require('./routes/event.routes');
var echoRouter  = require('./routes/echo.routes');

app.use('/', indexRouter);
app.use('/events', eventRouter);
app.use('/echo', echoRouter);


module.exports = app;
