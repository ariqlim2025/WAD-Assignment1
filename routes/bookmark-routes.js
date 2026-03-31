const express = require('express')
const router = express.Router()

const bookmarkController = require("../controllers/bookmark-controller")

// need to add middleware function to check if user is logged in for every route

router.get("/bookmarks", bookmarkController.showBookmarks) 

router.post("/bookmarks", bookmarkController.createBookmark)

router.get("/addBookmark", bookmarkController.showAddBookmarkForm)

router.get("/bookmarks/edit", bookmarkController.showEditBookmarkForm)

router.post("/bookmarks/edit", bookmarkController.editBookmark)

router.post("/bookmarks/delete", bookmarkController.deleteBookmark)

module.exports = router;