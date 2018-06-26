/** 
 * Populate room DynamoDB tables.
 * Run from repo root with `node bin/rooms/populate-room-tables.js`
 * [x] Workflow rooms
 * [ ] Office365 Rooms
 */

// Dependencies
require('dotenv').config();
var workflow_rooms = require('./rooms-maui.json');
var Room = require('../../rooms/room.model');


/**
 * Assigns a floor integer to a room based on it's numbering schema.
 * @param {string} roomNumber Office numbering schema (N540 => 5th floor, office 40, North side.)
 * @returns {string} floor
 */
function assignFloor(roomNumber) {
	// Edge case: the only null values are long form names
	// on the 2nd floor. e.g. 'SW Program Space', 'East Patio'
	if ((roomNumber === 'East Patio') || (roomNumber === 'SW Program Space')) {
	 return 2;
	}

	// Match the number portion of the ID. Regex returns a list.
	let real_rm_num = (roomNumber.match(/\d+/g))[0];
	
	// Return the floor from the building naming schema
	// Numbers designate floor, then room. e.g. N540 => 5th floor
	let floor = real_rm_num.slice(0, 1);

	return floor;
}

// Format and upload to DynamoDB
workflow_rooms.forEach(rm => {
  // Assign room number to each office
  rm.floor = assignFloor(rm.roomNumber);

  // Create the DB entry
  Room.create(rm, (err, data) => {
    if (err) console.log(err.message, rm.roomNumber);
    else console.log('Sucess! ', rm.roomNumber);
  })
});
