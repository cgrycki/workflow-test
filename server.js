/**
* Express Server
*/

// Environment variables
require('dotenv').config();

/* Dependencies -------------------------------------------------------------*/
var express      = require('express');
var path         = require('path');
var cors         = require('cors');
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

// Whitelist origins: [process.env.REDIRECT_URI, process.env.FRONTEND_URI, 'uiowa.edu']
app.use(cors({
  origin: [process.env.REDIRECT_URI, process.env.FRONTEND_URI, 'uiowa.edu'],
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: 'Content-Type,Origin,X-Amz-Date,Authorization,X-Api-Key,X-Api-Version'
}));                        // Cross origin resource sharing, so we can talk to our frontend
//app.('*', cors());
app.use(logger('dev'));     // Logging
app.use(cookieParser(process.env.MY_AWS_SECRET_ACCESS_KEY)); // And parse our cookies
app.use(bodyParser.json({ type: 'application/json' })); // For JSON headers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());       // API Parameter validation
app.set('trust proxy', 1);  // Reverse proxy
app.use(session);           // User Sessions backed by DynamoDB


// Only use Xray in production environment
if (process.env.NODE_ENV) {
  var xray = require('./utils/xray');
  app.use(xray.startTrace);
  app.use(xray.requestTrace);
}

// Cross domain cookies: Enables our Lambda function to communicate w/ our frontend
/*
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.REDIRECT_URI);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version', 'Content-type');

  if (req.method === 'OPTIONS') res.status(200).end();
  else next();
});
*/



// Authentication check
//app.use('*', require('./auth/auth.utils').requiresLogin);

// Routes
app.use('/',       require('./routes/index'));
app.use('/events', require('./events/event.routes'));
app.use('/rooms',  require('./rooms/room.routes'));
app.use('/auth',   require('./auth/auth.routes'));

// Close Xray
if (process.env.NODE_ENV) app.use(xray.endTrace);

module.exports = app;