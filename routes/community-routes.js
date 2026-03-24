const express = require('express');
const router = express.Router();

const communityController = require("../controllers/community-controller");
// add your community routes here later

router.get("/create-community", communityController.showCreateCommunityPage);
router.post("/create-community", communityController.createCommunity);

module.exports = router;