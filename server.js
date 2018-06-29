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
app.use(cors({
  origin: true,
  credentials: true
}));                        // Cross origin resource sharing, so we can talk to our frontend
app.options('*', cors());   // Pre-flight CORS
app.use(logger('dev'));     // Logging
app.use(cookieParser(process.env.MY_AWS_SECRET_ACCESS_KEY)); // And parse our cookies
app.use(bodyParser.json({ type: 'application/json' })); // For JSON headers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());       // API Parameter validation
app.set('trust proxy', 1); 
app.use(session);           // User Sessions backed by DynamoDB


// Only use Xray in production environment
if (process.env.NODE_ENV) {
  var xray = require('./utils/xray');
  app.use(xray.startTrace);
  app.use(xray.requestTrace);
}

// Cross domain cookies
app.use(function (req, res, next) {
  if ( req.method == 'OPTIONS' ) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version', 'Content-type');
    res.status(200).end();
  } else {
    next();
  }
});


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
