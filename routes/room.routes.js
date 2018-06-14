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



/* REST ---------------------------------------------------------------------*/
/* GET /rooms -- List CoPH rooms. */
router.get('/', (request, response) => roomUtils.getAstraRooms(request, response));


/* GET /rooms/:roomId -- Get one room info. */
router.get('/:roomId', 
  [
    roomUtils.validRoomId,
    utils.validateParams
  ],
  (request, response) => roomUtils.getAstraRoom(request.params.roomId, request, response)
);


/* GET /rooms/:roomId/:startDate/ -- Get one room's schedule on given day. */
router.get('/:roomId/:date',
  [
   roomUtils.validRoomId,
   roomUtils.validDate,
   utils.validateParams
  ],
  (request, response) => roomUtils.getAstraRoomScheduleDate(request, response)
);


/* GET /rooms/:roomId/:date/:startTime-:endTime -- Check if a room is free. */
router.get('/:roomId/:date/:startTime-:endTime', 
  [
    roomUtils.validRoomId,
    roomUtils.validDate,
    roomUtils.validStartTime,
    roomUtils.validEndTime,
    utils.validateParams
  ],
  (request, response) => console.log(request.params)
);


module.exports = router;