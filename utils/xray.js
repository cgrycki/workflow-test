/**
 * AWS Xray tracing middleware
 */

// Dependecies
var xrayAWS = require('aws-xray-sdk');
var xrayExpress = require('aws-xray-sdk-express');

// App Name
var app_name = 'workflow-test' || process.env.APP_NAME +'-'+ process.env.EENV;

// Used as middleware before the routes are assigned.
var startTrace = xrayAWS.express.openSegment(app_name);

const requestTrace = (request, response, next) => {
  console.log('Request trace: ', request);
  console.log('Process env: ', process.env);
  xrayAWS.captureAsyncFunc('send', function(subsegment) {
      subsegment.addAnnotation("AWS_ACCESS_KEY_ID", `${process.env.AWS_ACCESS_KEY_ID}`);
      subsegment.addAnnotation("AWS_SECRET_ACCESS_KEY", `${process.env.AWS_SECRET_ACCESS_KEY}`);
      subsegment.addAnnotation("AWS_SESSION_TOKEN", `${process.env.AWS_SESSION_TOKEN}`);
      subsegment.addAnnotation("AWS_REGION", `${process.env.AWS_REGION}`);
      subsegment.addAnnotation("REQUEST_COOKIES", JSON.stringify(request.cookies));
      subsegment.addAnnotation("REQUEST_SESSION", JSON.stringify(request.session));
      subsegment.close();
  });
  next();
};

// Make sure to close the xray after the routes are done!
// app.use(xrayAWS.express.closeSegment());
const endTrace = xrayAWS.express.closeSegment();

exports.startTrace = startTrace;
exports.requestTrace = requestTrace;
exports.endTrace = endTrace;