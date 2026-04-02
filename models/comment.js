// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content:   { type: String, required: true },
    authorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);
// Methods 
exports.addComment = function(comment) {
    return Comment.create(comment);
}

exports.retrieveComment = function(commentId) {
    return Comment.findById(commentId);
}

exports.removeComment = function(commentId) {
    return Comment.findByIdAndDelete(commentId);
}

exports.toEditComment = function(commentId, newContent) {
    return Comment.findByIdAndUpdate(
        commentId,
        { content: newContent, updatedAt: Date.now() },
        { new: true }
    );
}

exports.find = function(filter) {
    return Comment.find(filter);
}

exports.deleteMany = function(filter) {
    return Comment.deleteMany(filter);
}
