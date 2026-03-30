const Comment = require('../models/comment');
const User = require('../models/user')

// upload comment to the database
exports.createComment = async (req, res) => {
    try {
        const commentContent = req.body.newComment.trim();
        const postId = req.params.id;
        console.log(commentContent)


        // PLACEHOLDER USER !!!
        const placeholderUser = await User.findOne({ username: 'CodingQueen' });

        let newComment = {
            content : commentContent,
            authorId: placeholderUser,       // PLACEHOLDER USER !!!
            postId: postId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        let result = await Comment.addComment(newComment)

        console.log('Added Comment:' + result)

        // redirect to single post page
        res.redirect(`./${postId}`)
        
    } catch(error) {
        res.status(500).send(`Error creating comment: ${error.message}`);
    }
}