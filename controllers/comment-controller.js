const Comment = require('../models/comment');
const Post = require('../models/post');
const Bookmark = require('../models/bookmark');

// upload comment to the database
exports.createComment = async (req, res) => {
    try {
        // Get comment content from body (GET route)
        // If req.body.newComment doesnt exist, use '' empty string, then trim commentContent string
        const commentContent = (req.body.newComment || '').trim();

        // Get postId from url id parameter
        const postId = req.params.id;

        // Get user_id from session object 
        const user_id = req.session.user.user_id;

        // Get currentPost Post object, reference findSinglePost function from post.js models file



        // added stuff

        // Get currentPost Post object, reference findSinglePost function from post.js models file
        const currentPost = await Post.findSinglePost(postId).populate('authorId').populate('communityId');

        // If current post cannot be retrieved
        if (!currentPost) {
            return res.send("Post not found");
        }
        
        // Get community of current post
        // declare community variable
        let community;

        // Handle case where current post has no community. let community = communityId if true, if not it has no community
        if (currentPost.communityId) {
            community = currentPost.communityId;
        }
        else {
            community = { name: "No community" };
        }

        // Handle case where user gets deleted for POSTS
        // Keep the post and its contents, but the username is now 'deleted_user'
        if (!currentPost.authorId) {
            currentPost.authorId = { username: 'deleted_user' };
        }

        // get all comments under current post
        const currentComments = await Comment.find({ postId: postId }).populate('authorId');

        // Handle case where user get deleted for COMMENTS
        // Loop through an array to check if the author of the comment exists. 
        // If it doesnt exist, set a new id and deleted_user
        for (let i = 0; i < currentComments.length; i++) {
            if (!currentComments[i].authorId) {
                currentComments[i].authorId = { _id: 'deleted', username: 'deleted_user' };
            }
        }

        // If error exists
        const errors = []
        let isBookmarked = false;
        const existingBookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)
        if (existingBookmark) {
            isBookmarked = true;
        }


        // ERROR HANDLING
        // If user enters an empty comment
        if (!commentContent) {
            errors.push('Comment cannot be empty')
            return res.render('show', {
                currentPost: currentPost,
                community: community,
                currentComments: currentComments,
                user_id: user_id,
                postMsg: undefined,
                isBookmarked: isBookmarked,
                errors
            });

            // return res.send('Comment cannot be empty')
        }

        // create new comment object
        let newComment = {
            content : commentContent,
            authorId: user_id,       
            postId: postId,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Reference addComment function from post.js models file, adds newComment to MongoDB
        await Comment.addComment(newComment);

        // redirect to single post page once done adding comment
        res.redirect(`/posts/${postId}`)
        
    } catch(error) {
        res.send(`Error creating comment: ${error.message}, in createComment`);
    }
}
exports.showEditComment = async (req, res) => {
    try {
        // get postId from url :id
        const postId = req.params.id;

        // get commentId sent from show.ejs file
        const commentId = req.query.commentId;

        // get user_id from session object
        const user_id = req.session.user.user_id;

        // get current post with findSinglePost function from post models file, then populate community and authorId
        const currentPost = await Post.findSinglePost(postId).populate('communityId').populate('authorId');

        // get current comment with retrieveComment function from post models file
        const currentComment = await Comment.retrieveComment(commentId);

        // For errors
        const errors = [];

        // in case current post doesnt exist, current comment doesnt exist (cannot be found)
        if (!currentPost || !currentComment) {
            return res.send("Post or comment not found");
        }

        // in case comment does not belong to current post
        if (currentComment.postId.toString() !== postId.toString()) {
            return res.send("Comment does not belong to this post");
        }

        // in case current comment has no author id, or comment id does not match logged in user
        if (!currentComment.authorId || currentComment.authorId.toString() !== user_id.toString()) {
            return res.send("Unauthorized");
        }

        let community;

        if (currentPost) {
            community = currentPost.communityId ? currentPost.communityId.name : null;
        }

        res.render('editComment', {
            currentPost, 
            currentComment, 
            community, 
            user_id: user_id, 
            errors
        });

    } catch(error) {
        res.send(`Error editing comment: ${error.message}, in showEditComment`);
    }
}
// edit comment, and update database accordingly
exports.editComment = async (req, res) => {
    try {
        // retrieve data 
        const postId = req.params.id;
        const commentId = req.body.commentId;

        // if new comment doesnt exist, set as '', then trim
        const newComment = (req.body.newComment || '').trim();

        // get user id from session object
        const user_id = req.session.user.user_id;

        // retrieveComment function from comment models file
        const currentComment = await Comment.retrieveComment(commentId);

        // get current post using findSinglePost from Post models file, then populate
        const currentPost = await Post.findSinglePost(postId).populate('authorId').populate('communityId');

        if (!currentPost) {
            return res.send("Post not found");
        }

        // Get community of current post
        // declare community variable
        let community;

        // Handle case where current post has no community. let community = communityId if true, if not it has no community
        if (currentPost.communityId) {
            community = currentPost.communityId;
        }
        else {
            community = { name: "No community" };
        }

        // Handle case where user gets deleted for POSTS
        // Keep the post and its contents, but the username is now 'deleted_user'
        if (!currentPost.authorId) {
            currentPost.authorId = { username: 'deleted_user' };
        }

        const errors = []

        // if current comment cannot be retrieved
        if (!currentComment) {
            return res.send("Comment not found");
        }

        // if comment's post id does not match actual post id
        if (currentComment.postId.toString() !== postId.toString()) {
            // return res.send("Comment does not belong to this post");

            errors.push("Comment does not belong to this post")
            return res.render('editComment', {
                currentPost, 
                currentComment, 
                community, 
                user_id: user_id,
                errors
            });
        }

        // in case current comment has no author id, or comment id does not match logged in user
        if (!currentComment.authorId || currentComment.authorId.toString() !== user_id.toString()) {
            // return res.send("Unauthorized");

            errors.push("Comment does not belong to this post")
            return res.render('editComment', {
                currentPost, 
                currentComment, 
                community, 
                user_id: user_id,
                errors
            });
        }

        // in case edited comment is null / empty / ''
        if (!newComment) {
            // return res.send("Comment cannot be empty");

            errors.push("Comment cannot be empty")
            return res.render('editComment', {
                currentPost, 
                currentComment, 
                community, 
                user_id: user_id,
                errors
            });
        }

        // add edited comment to MongoDB via toEditComment from Comment models file
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
        // retrieve data
        const postId = req.params.id;
        const commentId = req.body.commentId;
        const user_id = req.session.user.user_id;

        // retrieveComment function, gets current comment you want to delete
        const currentComment = await Comment.retrieveComment(commentId);

        // ------------------ ADDED STUFF  --------------------
        const errors = []

        // get current post details using findSinglePost from Post models file, then populate
        const currentPost = await Post.findSinglePost(postId).populate('authorId').populate('communityId');

        if (!currentPost) {
            return res.send("Post not found");
        }

        // Get community of current post
        // declare community variable
        let community;

        // Handle case where current post has no community. let community = communityId if true, if not it has no community
        if (currentPost.communityId) {
            community = currentPost.communityId;
        }
        else {
            community = { name: "No community" };
        }

        // Handle case where user gets deleted for POSTS
        // Keep the post and its contents, but the username is now 'deleted_user'
        if (!currentPost.authorId) {
            currentPost.authorId = { username: 'deleted_user' };
        }

        // get all comments under current post
        const currentComments = await Comment.find({ postId: postId }).populate('authorId');
        let isBookmarked = false;
        const existingBookmark = await Bookmark.findBookmarkByUserAndPost(user_id, postId)
        if (existingBookmark) {
            isBookmarked = true;
        }

        // if cannot find comment
        if (!currentComment) {
            // return res.send("Comment not found");

            errors.push("Comment not found")
            return res.render('show', {
                currentPost: currentPost,
                community: community,
                currentComments: currentComments,
                user_id: user_id,
                postMsg: undefined,
                isBookmarked: isBookmarked,
                errors
            });
        }

        // if comment's post id does not match actual post id
        if (currentComment.postId.toString() !== postId.toString()) {
            // return res.send("Comment does not belong to this post");

            errors.push("Comment does not belong to this post")
            return res.render('show', {
                currentPost: currentPost,
                community: community,
                currentComments: currentComments,
                user_id: user_id,
                postMsg: undefined,
                isBookmarked: isBookmarked,
                errors
            });
        }

        // in case current comment has no author id, or comment id does not match logged in user
        if (!currentComment.authorId || currentComment.authorId.toString() !== user_id.toString()) {
            // return res.send("Unauthorized");

            errors.push("Unauthorized")
            return res.render('show', {
                currentPost: currentPost,
                community: community,
                currentComments: currentComments,
                user_id: user_id,
                postMsg: undefined,
                isBookmarked: isBookmarked,
                errors
            });
        }

        // Remove comment from mongoDB with removeComment function from COmment models file
        await Comment.removeComment(commentId);

        // Redirect back to single post page
        res.redirect(`/posts/${postId}`)
    } catch(error) {
        res.status(500).send(`Error editing comment: ${error.message}, in deleteComment`);
    }

}
