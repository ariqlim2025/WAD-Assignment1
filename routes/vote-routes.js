const express = require('express')
const router = express.Router();

const voteController = require('./../controllers/vote-controller');
const authMiddleware = require('./../middleware/auth-middleware');

// POST route to handle voting on a post
router.post('/vote', authMiddleware.isLoggedIn, voteController.addVote);

// EXPORT
module.exports = router;