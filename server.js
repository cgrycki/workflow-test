/* Dependencies -------------------------------------------------------------*/
require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var logger = require('morgan');


// App Instance
var app = express();

/* Further App Configurations -----------------------------------------------*/
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
var eventRouter = require('./routes/event.route');
var echoRouter  = require('./routes/echo');

app.use('/', indexRouter);
app.use('/events', eventRouter);
app.use('/echo', echoRouter);


module.exports = app;
