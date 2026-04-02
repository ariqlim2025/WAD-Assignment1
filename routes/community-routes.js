const express = require('express');
const router = express.Router();

const communityController = require("../controllers/community-controller");
const authMiddleware = require('./../middleware/auth-middleware');

router.get("/create-community", authMiddleware.isLoggedIn, communityController.showCreateCommunityPage);
router.post("/create-community", authMiddleware.isLoggedIn, communityController.createCommunity);

router.get("/communities", authMiddleware.isLoggedIn, communityController.showCommunitiesPage);

router.get("/communities/:communitySlug", authMiddleware.isLoggedIn, communityController.showSelectedCommunity);

router.get("/communities/:communitySlug/edit", authMiddleware.isLoggedIn, communityController.showEditCommunityPage);
router.post("/communities/:communitySlug/edit", authMiddleware.isLoggedIn, communityController.updateCommunity);
router.post("/communities/:communitySlug/delete", authMiddleware.isLoggedIn, communityController.deleteCommunity);

module.exports = router;
