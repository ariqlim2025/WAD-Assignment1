const {Comment, addComment, retrieveComment, removeComment, toEditComment } = require('../models/comment');
const User = require('../models/user');
const Post = require('../models/post')

// upload comment to the database
exports.createComment = async (req, res) => {
    try {
        const commentContent = req.body.newComment.trim();
        const postId = req.params.id;
        console.log(commentContent)


        // PLACEHOLDER USER !!!
        // const placeholderUser = await User.findOne({ username: 'AdminTester' });
        const userId = req.session.user?.user_id;

        let newComment = {
            content : commentContent,
            authorId: userId,
            // authorId: placeholderUser,       // PLACEHOLDER USER !!!
            postId: postId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        let result = await addComment(newComment)

        console.log('Added Comment:' + result)

        // redirect to single post page
        res.redirect(`./${postId}`)
        
    } catch(error) {
        res.status(500).send(`Error creating comment: ${error.message}`);
    }
}
exports.showEditComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentId = req.query.commentId;

        const currentPost = await Post.findSinglePost(postId).populate('communityId').populate('authorId')
        const currentComment = await retrieveComment(commentId)
        let community;

        if (currentPost) {
            community = currentPost.communityId.name || null
        }
        

        res.render('editComment', {currentPost, currentComment, community, user_id:'u001'})
    } catch(error) {
        res.status(500).send(`Error editing comment: ${error.message}`);
    }
}
// edit comment, and update database accordingly
exports.editComment = async (req, res) => {
    try {
        // retrieve data
        const postId = req.params.id;
        const commentId = req.body.commentId;
        const newComment = req.body.newComment;

        // edit comment
        await toEditComment(commentId, newComment);

        // once done editing bring back to original post page
        res.redirect(`/posts/${postId}`)

    } catch(error) {
        res.status(500).send(`Error editing comment: ${error.message}`);
    }
}
// delete comment, and update database accordingly
exports.deleteComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentId = req.body.commentId;

        // delete comment
        await removeComment(commentId)

        res.redirect(`/posts/${postId}`)
    } catch(error) {
        res.status(500).send(`Error editing comment: ${error.message}`);
    }

}