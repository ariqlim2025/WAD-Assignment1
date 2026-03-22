const express = require('express')
const router = express.Router();

const voteController = require('./../controllers/vote-controller');

// POST route to handle voting on a post
router.post('/vote', voteController.addVote);

// EXPORT
module.exports = router;