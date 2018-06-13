/**
* Events Router
* Testing:
  GET: curl http://localhost:3000/events
  GET (one): curl http://localhost:3000/events/<uuid>
  POST: curl -d '{"userEmail": "<valid email>", "textField": "<valid text>"}' -H "Content-Type: application/json" -X POST http://localhost:3000/events
  PATCH: curl -d '{"id": "<uuid>", "packageId": "<uuid>"}' -H "Content-Type: application/json" -X PATCH http://localhost:3000/events/
  DELETE: curl -X DELETE http://localhost:3000/events/<uuid>
*/

/* Router dependencies ------------------------------------------------------*/
const express   = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');
var    router   = express.Router();
var EventModel  = require('../models/index');


/* Router Parameters + Validation -------------------------------------------*/
const validateParamId = check('id').isUUID();


/* CRUD API -----------------------------------------------------------------*/
// GET events -- List events
router.get('/', function(request, result) {
  return EventModel
    .scan()
    .exec(function(error, data) {
      // Create an error message response if needed
      if (error) {
        console.error(error);
        return result.status(400).json(JSON.stringify(error));
      };

      // Create a response with the data if not
      return result.status(200).json(data.Items);
    });
});


// GET events/:id -- Get Event by ID
router.get('/:id', [validateParamId], function(request, result) {
  // Check parameters for validation
  const errors = validationResult(request);
  if (!errors.isEmpty()) return result.status(400).json({ errors: errors.mapped() });

  // Gather params for DynamoDB query.
  const params = request.params;
  
  // Query and return
  return EventModel
    .query(params.id)
    .exec(function(error, data) {
      // Send error message
      if (error) {
        console.error(error);
        return result.status(400).json({ error: error });
      }
      // Send data back; 200 if item was found otherwise 204
      else {
        let items = data.Items;
        return (items.length > 0) ?
          result.status(200).json(items[0]) :
          result.status(204).end();
      };
    });
});


// POST events -- Create new Event
router.post('/', [
  // Validate email with the following requirements
  check('userEmail')
    .isEmail()
    .withMessage('Must have a valid email')
    .trim()
    .normalizeEmail(),
  // Validate text field with the following requirements.
  check('textField')
    .isLength({min: 1, max: 50})
    .trim()
], function(request, result) {
  // check the errors of our param validation, send an error message if we have any
  const errors = validationResult(request);
  if (!errors.isEmpty()) return result.status(400).json({ errors: errors.mapped() });
  
  // Gather the request params and create a new Dyanmo Event object
  // Some attributes have been set by their default values: approved + packageId
  var params = request.body;
  var newEventParams = {
    textField: params.textField,
    userEmail: params.userEmail
  };

  // Return the save status of the new event
  return EventModel.create(newEventParams, function(error, model) {
    // Return error if we have one
    if (error) {
      console.log(error);
      return result.status(400).json({ error: error });
    } 
    // Otherwise return a successful HTTP status code
    else {
      console.log('New event created!');
      return result.status(201).end();
    };
  });
});


// PATCH events/:id/:packageId -- Updates an event's packageId
router.patch('/:id/:packageId', function(request, result) {
  // Check for errors in our parameters
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    console.error(errors);
    return result.status(400).json({ error: errors.mapped() });
  };

  // Hold these parameters: id + packageId
  const params = request.params;

  return EventModel.update(params, {ReturnValues: 'ALL_NEW'},
    function(error, data) {
      if (error) {
        console.error(error);
        return result.status(400).json({ error: error });
      }
      // Succesful update!
      else {
        console.log('Updated Event: ', data.attrs);
        return result.status(200).end();
      };
    });
});


// DELETE events/:id -- Delete event with given id
router.delete('/:id', 
  [validateParamId], 
  function(request, result) {

    // Check for errors
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      console.error(errors);
      return result.status(400).json({ error: errors.mapped() });
    };

    // Gather params from request
    const params = request.params;
    
    // Delete the event from our DB
    return EventModel.destroy(params.id, function(error, data) {
      if (error) {
        console.error(error);
        return result.status(400).json({ error: error });
      }
      // Otherwise send confirmation the event is deleted.
      else {
        console.log('Event with ID %s deleted!', params.id);
        return result.status(200).end();
      };
    });
  });


module.exports = router;