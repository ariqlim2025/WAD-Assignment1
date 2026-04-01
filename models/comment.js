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

exports.Comment = Comment;

// Methods 
exports.addComment = (comment) => {
    console.log('entered')
    return Comment.create(comment)
}

// exports.editComment = (comment) => {
//     return Comment
// }
exports.findAllComments = () => {
    return Comment.find()
}

exports.findCommentsByPost = (postId) => {
    return Comment.find({ postId: postId })
}

exports.retrieveComment = (commentId) => {
    return Comment.findById(commentId)
}

exports.removeComment = (commentId) => {
    return Comment.findByIdAndDelete(commentId);
}

exports.toEditComment = (commentId, newContent) => {
    return Comment.findByIdAndUpdate(
        commentId,
        { content: newContent, updatedAt: Date.now() },
        { new: true }
    );
}
