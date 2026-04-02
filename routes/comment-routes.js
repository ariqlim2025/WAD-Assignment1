const express = require('express');
const router = express.Router();

const commentController = require('./../controllers/comment-controller');
const authMiddleware = require('./../middleware/auth-middleware');


// To create comment, from show.ejs
router.post('/posts/:id/', authMiddleware.isLoggedIn, commentController.createComment);

// To show edit comment webpage, from show.ejs
router.get('/posts/:id/edit-comment', authMiddleware.isLoggedIn, commentController.showEditComment);

// To edit comment, send to controller to update MongoDB, from editComment.ejs
router.post('/posts/:id/edit-comment', authMiddleware.isLoggedIn, commentController.editComment);

// To delete comment, from show.ejs
router.post('/posts/:id/delete-comment', authMiddleware.isLoggedIn, commentController.deleteComment);


// export module
module.exports = router;

