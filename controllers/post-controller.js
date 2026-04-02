const Post = require('../models/post');
const Community = require('../models/community');
const Comment = require('../models/comment');
const Vote = require('../models/vote');
const Bookmark = require('../models/bookmark');

// Controller function to list home page with all posts
exports.showPosts = async (req, res) => {
    try {
        const postId = req.query.id;
        const user_id = req.session.user.user_id;
        const communities = await Community.allCommunities();

        // Edit page flow (kept from current app behaviour)
        if (postId) {
            const post = await Post.findById(postId).populate('authorId');

            if (!post) {
                return res.send("Post not found");
            }

            return res.render('posts', {
                post: post,
                communities: communities,
                currentUserId: user_id,
                user_id: user_id
            });
        }

        const posts = await Post.find().populate('authorId').populate('communityId');
        const comments = await Comment.find();
        const votes = await Vote.find();

        for (let i = 0; i < posts.length; i++) {
            if (posts[i].authorId) {
                posts[i].author = posts[i].authorId;
            }
            else {
                posts[i].author = { username: 'deleted_user' };
            }

            let count = 0;
            for (let k = 0; k < comments.length; k++) {
                if (comments[k].postId && comments[k].postId.toString() === posts[i]._id.toString()) {
                    count++;
                }
            }
            posts[i].commentCount = count;

            let score = 0;
            for (let v = 0; v < votes.length; v++) {
                if (votes[v].postId && votes[v].postId.toString() === posts[i]._id.toString()) {
                    score += votes[v].value;
                }
            }
            posts[i].score = score;
        }

        function compareByScore(a, b) {
            return b.score - a.score;
        }
        posts.sort(compareByScore);

        for (let i = 0; i < posts.length; i++) {
            posts[i].userVote = 0;
            for (let v = 0; v < votes.length; v++) {
                if (
                    votes[v].postId &&
                    votes[v].userId &&
                    votes[v].postId.toString() === posts[i]._id.toString() &&
                    votes[v].userId.toString() === user_id.toString()
                ) {
                    posts[i].userVote = votes[v].value;
                    break;
                }
            }
        }

        res.render('home', {
            posts: posts,
            communities: communities,
            currentUserId: user_id,
            user_id: user_id
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading posts");
    }
};

// Show create-post page
exports.showCreatePostPage = async (req, res) => {
    try {
        const communities = await Community.allCommunities();
        const user_id = req.session.user.user_id;

        res.render('posts', {
            post: null,
            communities: communities,
            currentUserId: user_id,
            user_id: user_id
        });
    } catch (error) {
        console.error(error);
        res.send("Error loading create post page");
    }
};

// Show single post page with comments
exports.showSinglePost = async (req, res) => {
    try {
        // get post ID from the url
        const postId = req.params.id;
        // get user ID from session object 
        const user_id = req.session.user.user_id;
        // get current post object, populate authorid and communityid
        const currentPost = await Post.findById(postId).populate('authorId').populate('communityId');

        // errors array
        const errors = [];

        // if current post cannot be retrieved, send error
        if (!currentPost) {
            return res.send("Post not found");
        }

        // get all comments under the selected post 
        const currentComments = await Comment.find({ postId: postId }).populate('authorId');

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

        // Handle case where user get deleted for COMMENTS
        // Loop through an array to check if the author of the comment exists. 
        // If it doesnt exist, set a new id and deleted_user
        for (let i = 0; i < currentComments.length; i++) {
            if (!currentComments[i].authorId) {
                currentComments[i].authorId = { _id: 'deleted', username: 'deleted_user' };
            }
        }

        // Display show.ejs (webpage that shows single post)
        res.render('show', {
            currentPost: currentPost,
            community: community,
            currentComments: currentComments,
            user_id: user_id,
            errors
        });
    } catch (error) {
        console.error(error);
        res.send("Error showing post" + error);
    }
};

// Create post
exports.createPost = async (req, res) => {
    try {
        const title = (req.body.title || '').trim();
        const content = (req.body.content || '').trim();
        const communityId = req.body.communityId;
        const user_id = req.session.user.user_id;
        const selectedCommunity = await Community.findCommunityById(communityId);

        if (!title || !content) {
            return res.send("Title and content are required");
        }

        if (!communityId) {
            return res.send("Community is required");
        }

        if (!selectedCommunity) {
            return res.send("Community not found");
        }

        const newPost = {
            title: title,
            content: content,
            authorId: user_id,
            communityId: communityId || null
        };

        await Post.createPost(newPost);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send("Error creating post");
    }
};

// Update post
exports.updatePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        const title = (req.body.title || '').trim();
        const content = (req.body.content || '').trim();
        const user_id = req.session.user.user_id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.send('Post not found');
        }

        if (post.authorId.toString() !== user_id.toString()) {
            return res.send('Unauthorized');
        }

        if (!title || !content) {
            return res.send('Title and content are required');
        }

        post.title = title;
        post.content = content;
        post.updatedAt = new Date();

        await post.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('Error updating post');
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        const user_id = req.session.user.user_id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.send("Post not found");
        }

        if (post.authorId.toString() !== user_id.toString()) {
            return res.send("Unauthorized: You cannot delete posts that do not belong to you");
        }

        await Comment.deleteMany({ postId: postId });
        await Vote.deleteMany({ postId: postId });
        await Bookmark.deleteMany({ postId: postId });
        await Post.findByIdAndDelete(postId);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send("Error deleting post. Please try again.");
    }
};
