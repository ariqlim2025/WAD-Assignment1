const express = require('express')
const router = express.Router();

const homeController = require('./../controllers/home-controller');

// GET route to display initial home webpage with posts upon '/'
router.get('/', homeController.showPosts);




// EXPORT
module.exports = router;