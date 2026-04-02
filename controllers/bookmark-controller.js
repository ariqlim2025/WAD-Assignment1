const Bookmark = require('../models/bookmark')
const Post = require('../models/post');

exports.showBookmarks = async (req, res) => {

    try {
        const user_id = req.session.user.user_id
        const bookmarkList = await Bookmark.viewAllBookmarksByUser(user_id)
        const validBookmarks = [];

        for (let i = 0; i < bookmarkList.length; i++) {
            if (bookmarkList[i].postId) {
                validBookmarks.push(bookmarkList[i]);
            }
        }

        res.render("viewBookmarks", {bookmarkList: validBookmarks})
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
        const user_id = req.session.user.user_id
        const postId = req.body.postId
        const note = (req.body.note || '').trim()
        const post = await Post.findById(postId);

        if (!post) {
            return res.send("Post not found");
        }

        if (!note) {
            return res.send("Note cannot be empty");
        }

        await Bookmark.createBookmark({userId : user_id, postId, note})
        res.redirect(`/posts/${postId}`) // TBC
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}

exports.editBookmark = async (req, res) => {
    try {
        const user_id = req.session.user.user_id
        const postId = req.body.postId
        const note = (req.body.note || '').trim()
        let bookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)

        if (!bookmark || !bookmark.postId) {
            return res.send("Bookmark not found");
        }

        if (!note) {
            return res.send("Note cannot be empty");
        }

        await Bookmark.editBookmark(user_id, postId, note)
        bookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)
        res.render("editBookmark", { bookmark, success: true })
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}

exports.showEditBookmarkForm = async (req, res) => {
    try {
        const user_id = req.session.user.user_id
        const postId = req.query.postId
        const bookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)

        if (!bookmark || !bookmark.postId) {
            return res.send("Bookmark not found");
        }

        res.render("editBookmark", { bookmark, success: false })
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}

exports.deleteBookmark = async (req, res) => {
    try {
        const user_id = req.session.user.user_id
        const postId = req.body.postId
        await Bookmark.deleteBookmark(user_id, postId)
        res.redirect('/bookmarks')
    } catch (error) {
        console.error(error.message)
        return res.send(`error: ${error.message}`)
    }
}
