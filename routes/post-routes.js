const express = require('express')
const router = express.Router();

const postController = require('./../controllers/post-controller');

// GET route to display initial home webpage with posts upon '/'
router.get('/', postController.showPosts);

router.get('/posts/:id', postController.showSinglePost);


// EXPORT
module.exports = router;