const express = require('express');
const router = express.Router();

const commentController = require('./../controllers/comment-controller');

router.post('/posts/:id/', commentController.createComment);

router.get('/posts/:id/edit-comment', commentController.showEditComment);

router.post('/posts/:id/edit-comment', commentController.editComment);

router.post('/posts/:id/delete-comment', commentController.deleteComment);


// export module
module.exports = router;

