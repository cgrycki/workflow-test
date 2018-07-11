/**
 * Error handling middleware
 */

const handleErrors = (error, request, response, next) => {
  let statusCode = error.httpStatusCode;
  let stack = error.stack;
  let requestHeaders = request.headers;

  response.status(statusCode).json({
    error: error.message,
    stack: stack,
    requestHeaders: requestHeaders
  });
}

exports.handleErrors = handleErrors;