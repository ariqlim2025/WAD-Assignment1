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

// add a comment
exports.addComment = function(comment) {
    return Comment.create(comment);
}

// get single comment
exports.retrieveComment = function(commentId) {
    return Comment.findOne({ _id: commentId });
}

// delete a comment from the database
exports.removeComment = function(commentId) {
    return Comment.deleteOne({ _id: commentId });
}

// find a comment then update it in the database
exports.toEditComment = function(commentId, newContent) {
    return Comment.updateOne(
        { _id: commentId },
        { $set: { content: newContent, updatedAt: Date.now() } }
    );
}

// find a comment
exports.find = function(filter) {
    return Comment.find(filter);
}

// delete >1 comment
exports.deleteMany = function(filter) {
    return Comment.deleteMany(filter);
}
