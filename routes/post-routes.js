const express = require('express')
const router = express.Router();

const postController = require('./../controllers/post-controller');
const authMiddleware = require('./../middleware/auth-middleware');

// GET route to display initial home webpage with posts upon '/'
router.get('/', postController.showPosts);

// Protected route - user must be logged in to create a post
router.get('/posts/new', authMiddleware.isLoggedIn, postController.showCreatePost);
router.post('/posts/new', authMiddleware.isLoggedIn, postController.createPost);

router.get('/posts/:id', postController.showSinglePost);


// EXPORT
module.exports = router;