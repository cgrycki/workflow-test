/**
 * Room Router
 * Responsible for returning rooms/schedules from our connected services.
 */


/* Dependencies -------------------------------------------------------------*/
const express = require('express');
const router  = express.Router();
const request = require('request');

const utils     = require('../utils/index');
const roomUtils = require('../utils/room.utils');


/* Parameters? ---*/
router.param('roomId', roomUtils.validRoomId);
router.param('date', roomUtils.validDate);
router.param('startTime', roomUtils.validStartTime);
router.param('endTime', roomUtils.validEndTime);


/* REST ---------------------------------------------------------------------*/
/* GET /rooms -- List CoPH rooms as JS objects. */
router.get('/', (request, response) => roomUtils.getAstraRooms(request, response));


/* GET /rooms/:roomId -- Get one room's info. */
router.get('/:roomId', 
  utils.validateParams,
  (request, response) => roomUtils.getAstraRoom(request, response)
);


/* GET /rooms/:roomId/:date/:startTime-:endTime -- Check if a room is free. */
//http://localhost:3001/rooms/N110/2017-02-07/
router.get('/:roomId/:date', //:startTime-:endTime', 
  [
    utils.validateParams,
    roomUtils.addDayMiddleware,
    roomUtils.getAstraRoomSchedule,
    roomUtils.formatAstraRoomSchedule
  ],
  (request, response) => response.send(request.roomSchedule)
);


module.exports = router;