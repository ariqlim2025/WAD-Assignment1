const Comment = require('../models/comment');
const Post = require('../models/post');

// upload comment to the database
exports.createComment = async (req, res) => {
    try {
        const commentContent = (req.body.newComment || '').trim();
        const postId = req.params.id;
        const user_id = req.session.user.user_id;
        const currentPost = await Post.findSinglePost(postId);

        if (!commentContent) {
            return res.send("Comment cannot be empty");
        }

        if (!currentPost) {
            return res.send("Post not found");
        }

        let newComment = {
            content : commentContent,
            authorId: user_id,       
            postId: postId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await Comment.addComment(newComment);

        // redirect to single post page
        res.redirect(`/posts/${postId}`)
        
    } catch(error) {
        res.status(500).send(`Error creating comment: ${error.message}, in createComment`);
    }
}
exports.showEditComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentId = req.query.commentId;
        const user_id = req.session.user.user_id;

        const currentPost = await Post.findSinglePost(postId).populate('communityId').populate('authorId');
        const currentComment = await Comment.retrieveComment(commentId);

        if (!currentPost || !currentComment) {
            return res.send("Post or comment not found");
        }

        if (currentComment.postId.toString() !== postId.toString()) {
            return res.send("Comment does not belong to this post");
        }

        if (!currentComment.authorId || currentComment.authorId.toString() !== user_id.toString()) {
            return res.send("Unauthorized");
        }

        let community;

        if (currentPost) {
            community = currentPost.communityId ? currentPost.communityId.name : null;
        }

        res.render('editComment', {currentPost, currentComment, community, user_id: user_id});
    } catch(error) {
        res.status(500).send(`Error editing comment: ${error.message}, in showEditComment`);
    }
}
// edit comment, and update database accordingly
exports.editComment = async (req, res) => {
    try {
        // retrieve data
        const postId = req.params.id;
        const commentId = req.body.commentId;
        const newComment = (req.body.newComment || '').trim();
        const user_id = req.session.user.user_id;

        const currentComment = await Comment.retrieveComment(commentId);

        if (!currentComment) {
            return res.send("Comment not found");
        }

        if (currentComment.postId.toString() !== postId.toString()) {
            return res.send("Comment does not belong to this post");
        }

        if (!currentComment.authorId || currentComment.authorId.toString() !== user_id.toString()) {
            return res.send("Unauthorized");
        }

        if (!newComment) {
            return res.send("Comment cannot be empty");
        }

        // edit comment
        await Comment.toEditComment(commentId, newComment);

        // once done editing bring back to original post page
        res.redirect(`/posts/${postId}`)

    } catch(error) {
        res.status(500).send(`Error editing comment: ${error.message}, in editComment`);
    }
}
// delete comment, and update database accordingly
exports.deleteComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentId = req.body.commentId;
        const user_id = req.session.user.user_id;

        const currentComment = await Comment.retrieveComment(commentId);

        if (!currentComment) {
            return res.send("Comment not found");
        }

        if (currentComment.postId.toString() !== postId.toString()) {
            return res.send("Comment does not belong to this post");
        }

        if (!currentComment.authorId || currentComment.authorId.toString() !== user_id.toString()) {
            return res.send("Unauthorized");
        }

        // delete comment
        await Comment.removeComment(commentId);

        res.redirect(`/posts/${postId}`)
    } catch(error) {
        res.status(500).send(`Error editing comment: ${error.message}, in deleteComment`);
    }

}
