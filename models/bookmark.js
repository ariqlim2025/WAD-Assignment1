// models/bookmark.js
const mongoose = require('mongoose')

const bookmarkSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    note:      { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

const Bookmark = mongoose.model('Bookmark', bookmarkSchema, "bookmarks");
exports.createBookmark = function(newBookmark) {
    return Bookmark.create(newBookmark);
}

exports.viewAllBookmarksByUser = function(userId) {
     return Bookmark.find({ userId: userId }).populate('postId').sort({ createdAt: -1 })
}

exports.findBookmarkByUserAndPost = function(userId, postId) {
    return Bookmark.findOne({ userId: userId, postId: postId }).populate('postId')
}

exports.editBookmark = function(userId, postId, newNote) {
    return Bookmark.updateOne({ userId: userId, postId: postId }, { note: newNote })
}

exports.deleteBookmark = function(userId, postId) {
    return Bookmark.deleteOne({ userId: userId, postId: postId })
}

exports.deleteMany = function(filter) {
    return Bookmark.deleteMany(filter)
}
