const express = require('express')
const router = express.Router();
const postController = require('./../controllers/post-controller');
const Community = require('../models/community');

//GET route to show homepage with all posts 
router.get('/', postController.showPosts);

// GET route to display the createpost page
router.get('/posts/new', async (req,res) => {
    // if there is no data in the database, this will crash so pass null to say that the variable exists but it is currently empty
    
    // pass in all the communities in the database. If there isn't any,
    const communities = await Community.find().lean();
    res.render('posts', {post:null, communities:communities});
});

//handles form submission
router.post('/createpost', postController.validatepost);

// updates form
router.post('/updatepost', postController.updatePost);

// handles delete seciton
router.post('/deletepost', postController.deletePost)

// EXPORT
module.exports = router;