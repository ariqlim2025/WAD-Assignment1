const express = require('express');
const router = express.Router();

const commentController = require('./../controllers/comment-controller');

router.post('/posts/:id/', commentController.createComment);


// export module
module.exports = router;

