const express = require('express')
const router = express.Router();

const homepageController = require('./../controllers/homepage-controller');

// GET route to display initial home webpage with posts upon '/'
router.get('/', homepageController.showPosts);




// EXPORT
module.exports = router;