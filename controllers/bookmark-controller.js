const Bookmark = require('../models/bookmark')

exports.showBookmarks = async (req, res) => {

    try {
        const bookmarkList = await Bookmark.viewAllBookmarksByUser(req.session.userId)
        res.render("viewBookmarks", {bookmarkList})
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}

exports.showAddBookmarkForm = (req, res) => {
    const postId = req.query.postId
    res.render("addBookmark", {postId})
}

exports.createBookmark = async (req, res) => {
    try {
        const postId = req.body.postId
        const note = req.body.note
        await Bookmark.createBookmark({userId : req.session.userId, postId, note})
        res.redirect(`/posts/${postId}`) // TBC
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}

exports.editBookmark = async (req, res) => {
    try {
        const postId = req.body.postId
        const note = req.body.note
        await Bookmark.editBookmark(req.session.userId, postId, note)
        const bookmark = await Bookmark.findBookmarkByUserAndPost(req.session.userId, postId)
        res.render("editBookmark", { bookmark, success: true })
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}

exports.showEditBookmarkForm = async (req, res) => {
    try {
        const postId = req.query.postId
        const bookmark = await Bookmark.findBookmarkByUserAndPost(req.session.userId, postId)
        res.render("editBookmark", { bookmark, success: false })
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}

exports.deleteBookmark = async (req, res) => {
    try {
        const postId = req.body.postId
        await Bookmark.deleteBookmark(req.session.userId, postId)
        res.redirect('/bookmarks')
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}