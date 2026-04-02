const express = require('express')
const router = express.Router()

const bookmarkController = require("../controllers/bookmark-controller")
const authMiddleware = require('./../middleware/auth-middleware');

router.get("/bookmarks", authMiddleware.isLoggedIn, bookmarkController.showBookmarks) 

router.post("/bookmarks", authMiddleware.isLoggedIn, bookmarkController.createBookmark)

router.get("/addBookmark", authMiddleware.isLoggedIn, bookmarkController.showAddBookmarkForm)

router.get("/bookmarks/edit", authMiddleware.isLoggedIn, bookmarkController.showEditBookmarkForm)

router.post("/bookmarks/edit", authMiddleware.isLoggedIn, bookmarkController.editBookmark)

router.post("/bookmarks/delete", authMiddleware.isLoggedIn, bookmarkController.deleteBookmark)

module.exports = router;
