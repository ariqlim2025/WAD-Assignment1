const express = require('express');
const router = express.Router();

const communityController = require("../controllers/community-controller");
// add your community routes here later

router.get("/create-community", communityController.showCreateCommunityPage);
router.post("/create-community", communityController.createCommunity);

router.get("/communities", communityController.showCommunitiesPage);

router.get("/communities/:communitySlug", communityController.showSelectedCommunity);

router.get("/communities/:communitySlug/edit", communityController.showEditCommunityPage);
router.post("/communities/:communitySlug/edit", communityController.updateCommunity);
router.post("/communities/:communitySlug/delete", communityController.deleteCommunity);

module.exports = router;