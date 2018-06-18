/**
* Room Utility Functions
*/


/* Dependencies -------------------------------------------------------------*/
const requests  = require('request');
const { check } = require('express-validator/check');
const moment    = require('moment');


/* Paramater Validation -----------------------------------------------------*/

// roomId
const validRoomId = check('roomId')
  .exists().withMessage('Must have a roomId to access API')
  .isString().withMessage('roomId must be a string')
  .isAlphanumeric().withMessage('roomId must be alphanumeric')
  .isUppercase().withMessage('Must be uppercased')
  .trim();

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

// DRY Convenience function
const getAstraURL = api => {
  return {
    url: api,
    method: 'GET',
    followRedirect: true,
    accepts: 'application/json',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
};



// Request MAUI/Astra service room list.
// Optional object filtering???
function getAstraRooms(request, response) {
  let url = 'https://api.maui.uiowa.edu/maui/api/pub/registrar/courses/AstraBldgRmCompleteList/list';
  let params = getAstraURL(url);
  
  // Make the request to Astra 
  requests(params, function(err, res, body) {
    if (!err && res.statusCode === 200) {
      // Parse list of room objects
      let allRooms = JSON.parse(body);
      
      /* Filter to include CPHB rooms. Rooms are objects of shape:
        {
          "buildingName": "COLLEGE OF PUBLIC HEALTH BLDG",
          "buildingCode": "CPHB",
          "roomNumber": "xxx",
          "roomName": null/"yyy",
          "regionList": [...]
        }
      */
      let cphbRooms = allRooms
        .filter(d => d.buildingCode === 'CPHB');
        /*.map(d => {
          return {
            roomNumber: d.roomNumber, 
            roomName: d.roomName, 
            regionList: d.regionList
          };
        });*/
      
      // Send filtered list back
      response.json(cphbRooms);
    } else {
      response.status(400).send(err);
    }
  });
}


// Get single Astra room's information
function getAstraRoom(request, response) {
  const { roomId } = request.params;
  const url = `https://api.maui.uiowa.edu/maui/api/pub/registrar/courses/AstraRoomData/CPHB/${roomId}`;
  const params = getAstraURL(url);
  
  requests(params, function(err, res, body) {
    if (!err && res.statusCode === 200) response.send(body);
    else {
      response.send(err);
    }
  });
};




// Format end date to automatically be one day after our start date
function addDayMiddleware(request, response, next) {
  // We'll need to add one day, get day in milliseconds
  const DAY = 60 * 60 * 24 * 1000;

  // Parse the date from params
  let startDateObj = new Date(request.params.date);
  let endDateObj = new Date(startDateObj.getTime() + DAY);

  // Convert dates back to string
  let startDate = startDateObj.toISOString().split('T')[0];
  let endDate = endDateObj.toISOString().split('T')[0];
  
  // Add them to the request and keep going
  request.startDate = startDate;
  request.endDate = endDate;
  next();
}

// Fetch Astra room schedule and attach event list to request
function getAstraRoomSchedule(request, response, next) {
  // Variables to fill out our API call
  const startDate = request.startDate;
  const endDate   = request.endDate;
  const roomId    = request.params.roomId;

  // Request parameters
  const url = `https://api.maui.uiowa.edu/maui/api/pub/registrar/courses/AstraRoomSchedule/${startDate}/${endDate}/CPHB/${roomId}`;
  const params = getAstraURL(url);

  requests(params, function(err, res, body) {
    // No errors, assign object to request
    if (!err && res.statusCode === 200) {
      request.roomSchedule = JSON.parse(body);
      next()
    } 
    // Nothing returned for the room's schedule
    else if (!err && res.statusCode === 204) {
      request.roomSchedule = [];
      next();
    } 
    // There was an error somewhere
    else {
      response.status(500).json({ error: err });
    }
  });
}

/**
 * Function that formats two strings as a JS Date object
 * @param {string} date Date formatted as 'MMMM D, YYYY': 'February 7, 2017'
 * @param {string} time Time formatted as 'h:mmA': '11:00AM'
 * @return {Date}
 */
const formatAstraDate = (date, time) => moment(date +' '+time, "MMMM D, YYYY h:mmA");

// Format event list into consumable JS objects for comparison
function formatAstraRoomSchedule(request, response, next) {
  const fmtSchedule = request.roomSchedule.map(d => {
    // Gather and clean datetime parts
    let date = d.date.trim();
    let start = d.startTime.trim();
    let end = d.endTime.trim();

    // Convert to JS Date object
    let startTime = formatAstraDate(date, start);
    let endTime = formatAstraDate(date, end);

    return { 
      startTime, 
      endTime,
      roomName: d.roomName,
      roomNumber: d.roomNumber,
      date: d.date
    };
  });

  request.roomSchedule = fmtSchedule;
  next();
}




// Params
exports.validRoomId    = validRoomId;
exports.validDate      = validDate;
exports.validStartTime = validStartTime;
exports.validEndTime   = validEndTime;
// Kind of working
exports.getAstraRooms = getAstraRooms;
exports.getAstraRoom  = getAstraRoom;
// WIP
exports.addDayMiddleware   = addDayMiddleware;
exports.getAstraRoomSchedule = getAstraRoomSchedule;
exports.formatAstraRoomSchedule = formatAstraRoomSchedule;