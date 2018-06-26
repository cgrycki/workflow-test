/**
 * AWS Xray tracing middleware
 */

// Dependecies
var xrayAWS = require('aws-xray-sdk');
var xrayExpress = require('aws-xray-sdk-express');

// App uses this
var xray = xrayAWS.express.openSegment(process.env.APP_NAME);

var segment = req.segment;
segment.addAnnotation("AWS_ACCESS_KEY_ID", process.env.AWS_ACCESS_KEY_ID);
segment.addAnnotation("AWS_ACCESS_KEY", process.env.AWS_ACCESS_KEY);
segment.addAnnotation("AWS_SECRET_KEY", process.env.AWS_SECRET_KEY);
segment.addAnnotation("AWS_SECRET_ACCESS_KEY", process.env.AWS_SECRET_ACCESS_KEY);
segment.addAnnotation("AWS_SESSION_TOKEN", process.env.AWS_SESSION_TOKEN);
segment.addAnnotation("AWS_SECURITY_TOKEN", process.env.AWS_SECURITY_TOKEN);
segment.addAnnotation("AWS_REGION", process.env.AWS_REGION);

// Make sure to close the xray after the routes are done!
// app.use(xrayAWS.express.closeSegment());
