/**
 * Echo Route
 */

const express = require('express');
const router  = express.Router();

/* GET /echo - Return request's query params in JSON format. */
router.get('/', (request, result) => result.json(request.query));

module.exports = router;