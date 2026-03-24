const express = require('express');
const router = express.Router();

const communityController = require("../controllers/community-controller");
// add your community routes here later

router.get("/create-community", communityController.addCommunity);

module.exports = router;