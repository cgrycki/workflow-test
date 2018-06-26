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

// Xray testing
var AWSXRay = require('aws-xray-sdk');
//var xrayExpress = require('aws-xray-sdk-express');


// App Instance
var app = express();

// Xray testing
app.use(AWSXRay.express.openSegment('workflow-test'));

/* Further App Configurations -----------------------------------------------*/
// Security best practices
app.use(helmet());
// Logging
app.use(logger('dev'));
// And cookies
app.use(cookieParser());
// For JSON headers
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));
// User Sessions backed by DynamoDB
app.use(session);
// API Parameter validation
app.use(validator());

var segment = req.segment;
segment.addAnnotation("AWS_ACCESS_KEY_ID", process.env.AWS_ACCESS_KEY_ID);
segment.addAnnotation("AWS_ACCESS_KEY", process.env.AWS_ACCESS_KEY);
segment.addAnnotation("AWS_SECRET_KEY", process.env.AWS_SECRET_KEY);
segment.addAnnotation("AWS_SECRET_ACCESS_KEY", process.env.AWS_SECRET_ACCESS_KEY);
segment.addAnnotation("AWS_SESSION_TOKEN", process.env.AWS_SESSION_TOKEN);
segment.addAnnotation("AWS_SECURITY_TOKEN", process.env.AWS_SECURITY_TOKEN);
segment.addAnnotation("AWS_REGION", process.env.AWS_REGION);

// Authentication check
//app.use('*', require('./auth/auth.utils').requiresLogin);


// Routes
var indexRouter = require('./routes/index');
var eventRouter = require('./events/event.routes');
var roomRouter  = require('./rooms/room.routes');

//app.use('/', indexRouter);
app.use('/events', eventRouter);
app.use('/rooms', roomRouter);
app.use('/auth', require('./auth/auth.routes'));


// Xray testing
app.use(AWSXRay.express.closeSegment());

module.exports = app;
