/**
* Room Utility Functions
*/


/* Dependencies -------------------------------------------------------------*/
const requests = require('request');
const { check } = require('express-validator/check');


/* Paramater Validation -----------------------------------------------------*/

// roomId
const validRoomId = check('roomId')
  .exists().withMessage('Must have a roomId to access API')
  .isString();

// date
const validDate = check('date')
  .exists().withMessage('You need a date param')
  .isString().withMessage('Date param should be formatted YYYY-mm-dd')
  .trim();

// startTime
const validStartTime = check('startTime')
  .exists().withMessage('Must have a start time')
  .isString()
  .trim();

// endTime
const validEndTime = check('endTime')
  .exists()
  .isString()
  .trim();


/* Utilities ----------------------------------------------------------------*/

// Range check



// Request MAUI/Astra service room list
function getAstraRooms(request, response) {
  const params = {
    url: 'https://api.maui.uiowa.edu/maui/api/pub/registrar/courses/AstraBldgRmCompleteList/list',
    method: 'GET',
    followRedirect: true,
    accepts: 'application/json',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  
  // Make the request to Astra 
  requests(params, function(err, res, body) {
    if (!err && res.statusCode === 200) {
      // Parse list of room objects
      let allRooms = JSON.parse(body);
      
      // Filter to include CPHB rooms
      let cphbRooms = allRooms.filter(d => d.buildingCode === 'CPHB');
      
      // Send filtered list back
      response.send(JSON.stringify(cphbRooms));
    } else {
      response.status(400).send(err);
    }
  });
}

// Get single Astra room's information
function getAstraRoom(roomNumber, request, response) {
  const params = {
    url: 'https://api.maui.uiowa.edu/maui/api/pub/registrar/courses/AstraRoomData/CPHB/' + roomNumber,
    method: 'GET',
    accepts: 'application/json',
    followRedirect: true,
    json: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  
  requests(params, function(err, res, body) {
    if (!err && res.statusCode === 200) response.json(body);
    else response.send(err);
  });
};


// Get Astra room schedule for a given day
function getAstraRoomScheduleDate(request, response) {
  // Gather params from request
  const req_params = request.params;

  // Parse the date from params
  let startDateObj = new Date(req_params.date);
  let DAY = 60 * 60 * 24 * 1000;
  let endDateObj = new Date(startDateObj.getTime() + DAY);

  // Convert dates back to string
  let startDate = startDateObj.toISOString().split('T')[0];
  let endDate = endDateObj.toISOString().split('T')[0];

  // Create the RESTful header
  const params = {
    url: 'https://api.maui.uiowa.edu/maui/api/pub/registrar/courses/AstraRoomSchedule/'
      + startDate + '/'
      + endDate + '/CPHB/'
      + req_params.roomId,
    method: 'GET',
    accepts: 'application/json',
    followRedirect: true,
    json: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  requests(params, function(err, res, body) {
    if (!err && res.statusCode === 200) {
      response.status(200).send(body);
    } else {
      response.status(404).json({ error: JSON.stringify(err) });
    }
  });
}



// Get Astra schedule for room with given :roomId
function getAstraRoomScheduleTime(request, response) {
  const req_params = request.params;
  const params = {
    url: 'https://api.maui.uiowa.edu/maui/api/pub/registrar/courses/AstraRoomSchedule/' 
      + req_params.startDate + '/'
      + req_params.endDate + '/CPHB/' 
      + req_params.roomNumber,
      method: 'GET',
      accepts: 'application/json',
      followRedirect: true,
      json: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    console.log(params.url);

    request(params, function(err, res, body) {
      // Success
      if (!err && res.statusCode === 200) {

        console.log(JSON.parse(body));
        response.status(200).send(body);
      } else {
        response.send(404).json({ error: JSON.stringify(err) });
      }
    });
}





// Request sharepoint service







exports.validRoomId              = validRoomId;
exports.validDate                = validDate;
exports.validStartTime           = validStartTime;
exports.validEndTime             = validEndTime;

exports.getAstraRooms            = getAstraRooms;
exports.getAstraRoom             = getAstraRoom;
exports.getAstraRoomScheduleDate = getAstraRoomScheduleDate;
exports.getAstraRoomScheduleTime = getAstraRoomScheduleTime;