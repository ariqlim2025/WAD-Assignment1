const Bookmark = require('../models/bookmark')
const Post = require('../models/post');

exports.showBookmarks = async (req, res) => {

    try {
        const user_id = req.session.user.user_id
        const bookmarkList = await Bookmark.viewAllBookmarksByUser(user_id)
        const validBookmarks = [];
        const bookmarkError = req.query.error || '';
        const bookmarkSuccess = req.session.bookmarkSuccess || req.query.success || '';
        delete req.session.bookmarkSuccess;

        for (let i = 0; i < bookmarkList.length; i++) {
            if (bookmarkList[i].postId) {
                validBookmarks.push(bookmarkList[i]);
            }
        }

        res.render("viewBookmarks", {bookmarkList: validBookmarks, bookmarkError, bookmarkSuccess})
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.showAddBookmarkForm = (req, res) => {
    const postId = req.query.postId
    const bookmarkError = req.query.error || '';

    if (!postId) {
        return res.redirect('/bookmarks?error=Post not found');
    }

    res.render("addBookmark", {postId, bookmarkError})
}

exports.createBookmark = async (req, res) => {
    try {
        const user_id = req.session.user.user_id
        const postId = req.body.postId
        const note = (req.body.note || '').trim()

        if (!postId) {
            return res.redirect('/bookmarks?error=Post not found');
        }

        const post = await Post.findById(postId);
        const existingBookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)

        if (!post) {
            return res.redirect('/bookmarks?error=Post not found');
        }

        if (existingBookmark) {
            return res.redirect(`/posts/${postId}?error=Post already in bookmarks`);
        }

        if (!note) {
            return res.redirect(`/addBookmark?postId=${postId}&error=Note cannot be empty`);
        }

        await Bookmark.createBookmark({userId : user_id, postId, note})
        return res.redirect(`/posts/${postId}`)
    } catch (error) {
        const postId = req.body.postId
        if (error && error.code === 11000 && postId) {
            return res.redirect(`/posts/${postId}?error=Post already in bookmarks`)
        }
        return res.status(500).json({ error: error.message });
    }
}

exports.editBookmark = async (req, res) => {
    try {
        const user_id = req.session.user.user_id
        const postId = req.body.postId
        const note = (req.body.note || '').trim()

        if (!postId) {
            return res.redirect('/bookmarks?error=Bookmark not found');
        }

        let bookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)

        if (!bookmark || !bookmark.postId) {
            return res.redirect('/bookmarks?error=Bookmark not found');
        }

        if (!note) {
            return res.redirect(`/bookmarks/edit?postId=${postId}&error=Note cannot be empty`);
        }

        const oldNote = (bookmark.note || '').trim();
        if (note === oldNote) {
            return res.redirect(`/bookmarks/edit?postId=${postId}&error=No changes were made, note is the same`);
        }

        await Bookmark.editBookmark(user_id, postId, note)
        return res.redirect(`/bookmarks/edit?postId=${postId}&success=Bookmark updated successfully`);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.showEditBookmarkForm = async (req, res) => {
    try {
        const user_id = req.session.user.user_id
        const postId = req.query.postId
        const bookmarkError = req.query.error || '';
        const bookmarkSuccess = req.query.success || '';

        if (!postId) {
            return res.redirect('/bookmarks?error=Bookmark not found');
        }

        const bookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)

        if (!bookmark || !bookmark.postId) {
            return res.redirect('/bookmarks?error=Bookmark not found');
        }

        res.render("editBookmark", { bookmark, success: !!bookmarkSuccess, bookmarkError, bookmarkSuccess })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteBookmark = async (req, res) => {
    try {
        const user_id = req.session.user.user_id
        const postId = req.body.postId

        if (!postId) {
            return res.redirect('/bookmarks?error=Bookmark not found');
        }

        const result = await Bookmark.deleteBookmark(user_id, postId)

        if (!result || result.deletedCount === 0) {
            return res.redirect('/bookmarks?error=Bookmark not found');
        }

        req.session.bookmarkSuccess = 'Bookmark deleted successfully';
        return res.redirect('/bookmarks');
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
