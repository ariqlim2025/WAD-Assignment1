const express = require('express')
const router = express.Router();
const postController = require('./../controllers/post-controller');
const authMiddleware = require('./../middleware/auth-middleware');

//GET route to show homepage with all posts 
router.get('/home', authMiddleware.isLoggedIn, postController.showPosts);

// GET route to display the createpost page
router.get('/posts/new', authMiddleware.isLoggedIn, postController.showCreatePostPage);

// GET route to display one single post, from home.ejs
router.get('/posts/:id', authMiddleware.isLoggedIn, postController.showSinglePost);

//handles form submission
router.post('/createpost', authMiddleware.isLoggedIn, postController.createPost);

// updates form
router.post('/updatepost', authMiddleware.isLoggedIn, postController.updatePost);

// handles delete seciton
router.post('/deletepost', authMiddleware.isLoggedIn, postController.deletePost)

// EXPORT
module.exports = router;
