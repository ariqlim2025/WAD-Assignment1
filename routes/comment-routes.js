const express = require('express');
const router = express.Router();

const commentController = require('./../controllers/comment-controller');
const authMiddleware = require('./../middleware/auth-middleware');

router.post('/posts/:id/', authMiddleware.isLoggedIn, commentController.createComment);

router.get('/posts/:id/edit-comment', authMiddleware.isLoggedIn, commentController.showEditComment);

router.post('/posts/:id/edit-comment', authMiddleware.isLoggedIn, commentController.editComment);

router.post('/posts/:id/delete-comment', authMiddleware.isLoggedIn, commentController.deleteComment);


// export module
module.exports = router;

