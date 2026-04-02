const Post = require('../models/post');
const Comment = require('../models/comment');
const Bookmark = require('../models/bookmark');
const Vote = require('../models/vote');
const Community = require('../models/community');

// Controller function to add a community
exports.showCreateCommunityPage = (req, res) => {
    const user_id = req.session.user.user_id;

    res.render('createCommunity', { 
        user_id,
        community_name: '',
        description_details: '',
        communityNameError: '',
        communityDescriptionError: '',
        otherError: ''
     });
}

exports.createCommunity = async (req, res) => {
    const user_id = req.session.user.user_id;

    // Regex to disallow special characters: : / ? # [ ] @ ! $ & ' ( ) * + , ; =
    const communityRegex = /^[^:/?#\[\]@!$&'()*+,;=]+$/;

    // To store error messages
    let communityNameError = '';
    let communityDescriptionError = '';

    // Get the community name and description from the request body
    let community_name = '';
    let description_details = '';

    if (req.body.community) {
        community_name = req.body.community.trim();
    }

    if (req.body.description) {
        description_details = req.body.description.trim();
    }

    // validation for community name
    if (!community_name) {
        communityNameError = 'Community name is required';
    }
    else if (!communityRegex.test(community_name)) {
      communityNameError = "Community name cannot contain special characters : / ? # [ ] @ ! $ & ' ( ) * + , ; =";
    }

    // validation for description details
    if (!description_details) {
        communityDescriptionError = 'Description detail is required';
    }

    // If validation failed, re-render the same page with error messages.
    if (communityNameError || communityDescriptionError) {
        return res.render('createCommunity', {
            user_id,
            community_name,
            description_details,
            communityNameError,
            communityDescriptionError,
            otherError: ''
        });
    }

    try {
        // Friendly check first (so you can show an error message on the page).
        // `unique: true` on `name` will protect at the DB level.
        const existingCommunity = await Community.findCommunity(community_name);
        if (existingCommunity) {
            communityNameError = 'Community name already exists';
            return res.render('createCommunity', {
                user_id,
                community_name,
                description_details,
                communityNameError,
                communityDescriptionError,
                otherError: ''
            });
        }
        
        // making community object and calling model to add to mongodb
        const newCommunity = {
            name: community_name,
            description: description_details,
            createdBy: user_id 
        };
        await Community.createCommunity(newCommunity);

        // show success message
        return res.render('createCommunity', {
            user_id,
            community_name,
            description_details,
            communityNameError: '',
            communityDescriptionError: '',
            otherError: ''
        });

    } catch (error) {
        // If two requests race, MongoDB throws duplicate key error (11000)
        if (error && error.code === 11000) {
            communityNameError = 'Community name already exists';
            return res.render('createCommunity', {
                user_id,
                community_name,
                description_details,
                communityNameError,
                communityDescriptionError,
                otherError: ''
            });
        }
        // server error
        console.error('Error creating community:', error);
        return res.render('createCommunity', {
            user_id,
            community_name,
            description_details,
            communityNameError,
            communityDescriptionError,
            otherError: "An internal server error occurred."
        });
    }
}

// show all communities page
exports.showCommunitiesPage = async (req, res) => {
    const user_id = req.session.user.user_id;
    const communities = await Community.allCommunities();

    res.render('showCommunity', {
        user_id,
        communities: communities
    });
}

// show the community that the user selected
exports.showSelectedCommunity = async (req, res) => {
    try {
        const user_id = req.session.user.user_id;
        
        // get the community name from the url
        const { communitySlug } = req.params;

        // find if there is such community
        const selectedCommunity = await Community.findCommunity(communitySlug);

        // if no community
        if (!selectedCommunity) {

            return res.render('showSelectedCommunity', {
                user_id,
                community: '',
                posts: '',
                isCreator: '',
                otherError: "Community cannot be found."
            });
        }

        // if there is community, find all related posts
        const posts = await Post.find({ communityId: selectedCommunity._id })
            .populate('authorId')
            .populate('communityId');
        
        // find all related comments also
        const comments = await Comment.find();
        const votes = await Vote.find();

        for (let i = 0; i < posts.length; i++) {
            // Find the user whose _id mathces the post's authors ID
            if (posts[i].authorId) {
                posts[i].author = posts[i].authorId;
            }
            else {
                posts[i].author = { username: 'deleted_user' };
            }
            // Count how many comments belong to this post
            let count = 0;
            for (let k = 0; k < comments.length; k++) {
                if (comments[k].postId && comments[k].postId.toString() === posts[i]._id.toString()) {
                    count++;
                }
            }
            posts[i].commentCount = count;
    
            // Count how many upvotes and downvotes the post has
            let score = 0;
            for (let v = 0; v < votes.length; v++) {
                if (votes[v].postId && votes[v].postId.toString() === posts[i]._id.toString()) {
                    score += votes[v].value;
                }
            }
            posts[i].score = score;
        }
    
        // Sort the posts object by vote score, highest at the top 
        function compareByScore(a,b) {
            return b.score - a.score;
        }
        posts.sort(compareByScore);
        // console.log(posts);


        if (user_id) {
            // Figure out which posts did the user upvote or downvote and add to the posts dict
            for (let i = 0; i < posts.length; i++) {
                posts[i].userVote = 0;
                for (let v=0; v < votes.length; v++) {
                    if (votes[v].postId && votes[v].userId) {
                        if (votes[v].postId.toString() === posts[i]._id.toString() && votes[v].userId.toString() === user_id.toString()) {
                            posts[i].userVote = votes[v].value;
                            break;
                        }
                    }
                }
            }
        }
        else {
            // If user is not logged in, set all posts' userVote to 0
            for (let i = 0; i < posts.length; i++) {
                posts[i].userVote = 0;
            }
        }

        // check if the user is the creator of the community, then can edit community
        let creatorId = "";
        if (selectedCommunity.createdBy) {
            creatorId = selectedCommunity.createdBy.toString();
        }

        let isCreator = "";
        if (creatorId && creatorId === user_id.toString()) {
            isCreator = 'Yes';
        }

        return res.render('showSelectedCommunity', {
            user_id,
            community: selectedCommunity,
            posts,
            isCreator,
            otherError: ''
        });

        
    }
    catch(error) {
        console.error("Error loading selected community: ", error);

        return res.render('showSelectedCommunity', {
            user_id,
            community: '',
            posts: '',
            isCreator: '',
            otherError: "An internal server error occurred."
        });
    }
}

// show the edit community page
exports.showEditCommunityPage = async (req, res) => {
    try {
        const user_id = req.session.user.user_id;
        // get community name from url
        const { communitySlug } = req.params;

        // find if there is such community
        const selectedCommunity = await Community.findCommunity(communitySlug);

        // if no such community
        if (!selectedCommunity) {

            return res.render('editCommunity', {
                user_id,
                communitySlug,
                community_name: selectedCommunity.name,
                description_details: selectedCommunity.description,
                communityNameError: '',
                communityDescriptionError: '',
                otherError: "Community cannot be found."
            });
        }

        // check if user is creator of the community again
        let creatorId = "";
        if (selectedCommunity.createdBy) {
            creatorId = selectedCommunity.createdBy.toString();
        }

        let isCreator = "";
        if (creatorId && creatorId === user_id.toString()) {
            isCreator = 'Yes';
        }

        if (!isCreator) {

            return res.render('editCommunity', {
                user_id,
                communitySlug,
                community_name: '',
                description_details: '',
                communityNameError: '',
                communityDescriptionError: '',
                otherError: "You can only edit communities you created."
            });

        }

        // if user is creator, then render the edit page
        return res.render('editCommunity', {
            user_id,
            communitySlug,
            community_name: selectedCommunity.name,
            description_details: selectedCommunity.description,
            communityNameError: '',
            communityDescriptionError: '',
            otherError: ''
        });
        
    } catch (error) {
        const { communitySlug } = req.params;
        console.error('Error loading edit community page:', error);
       
        return res.render('editCommunity', {
            user_id,
            communitySlug,
            community_name: selectedCommunity.name,
            description_details: selectedCommunity.description,
            communityNameError: '',
            communityDescriptionError: '',
            otherError: "An internal server error occurred."
        });
    }
}

// after checking if user is the creator, then they can update the community
exports.updateCommunity = async (req, res) => {
    const user_id = req.session.user.user_id;

    // Regex to disallow special characters: : / ? # [ ] @ ! $ & ' ( ) * + , ; =
    const communityRegex = /^[^:/?#\[\]@!$&'()*+,;=]+$/;

    // string to store errors
    let communityNameError = '';
    let communityDescriptionError = '';

    // the previous name is taken from the url
    const { communitySlug } = req.params;
    const oldName = communitySlug;

    // new name and description from the body 
    let community_name = '';
    let description_details = '';

    if (req.body.community) {
        community_name = req.body.community.trim();
    }

    if (req.body.description) {
        description_details = req.body.description.trim();
    }

    // validating the name
    if (!community_name) {
        communityNameError = 'Community name is required';
    }
    else if (!communityRegex.test(community_name)) {
      communityNameError = "Community name cannot contain special characters : / ? # [ ] @ ! $ & ' ( ) * + , ; =";
    }

    // validating the description
    if (!description_details) {
        communityDescriptionError = 'Description detail is required';
    }

    try {
        // find if community exist
        const community = await Community.findCommunity(oldName);

        // if not exist
        if (!community) {

            return res.render('editCommunity', {
                user_id,
                communitySlug,
                community_name,
                description_details,
                communityNameError,
                communityDescriptionError: '',
                otherError: "Community cannot be found."
            });
        }

        // check if user is creator
        let creatorId = "";
        if (community.createdBy) {
            creatorId = community.createdBy.toString();
        }

        let isCreator = "";
        if (creatorId && creatorId === user_id.toString()) {
            isCreator = 'Yes';
        }

        if (!isCreator) {

            return res.render('editCommunity', {
                user_id,
                communitySlug,
                community_name: '',
                description_details: '',
                communityNameError: '',
                communityDescriptionError: '',
                otherError: "You can only edit communities you created."
            });
        }

        // if there is any error, render the error on the page
        if (communityNameError || communityDescriptionError) {
            return res.render('editCommunity', {
                user_id,
                communitySlug,
                community_name,
                description_details,
                communityNameError,
                communityDescriptionError,
                otherError: ''
            });
        }

        // check if user changed the name of community
        if (community_name !== community.name) {
            // then check if new name already exist
            const taken = await Community.findCommunity(community_name);
            // render error if new name already exist
            if (taken) {
                communityNameError = 'Community name already exists';
                return res.render('editCommunity', {
                    user_id,
                    communitySlug,
                    community_name,
                    description_details,
                    communityNameError,
                    communityDescriptionError: '',
                    otherError: ''
                });
            }
        }

        // update the name and the description (persist via model helper using updateOne)
        await Community.updateCommunityDetails(community._id, {
            name: community_name,
            description: description_details
        });

        const newSlug = community_name;
        // create the new slug to redirect user to the new page
        return res.redirect(`/communities/${newSlug}`);

    } catch (error) {
        // If two requests race, MongoDB throws duplicate key error (11000)
        if (error && error.code === 11000) {
            return res.render('editCommunity', {
                user_id,
                communitySlug,
                community_name,
                description_details,
                communityNameError: 'Community name already exists',
                communityDescriptionError: '',
                otherError: ''
            });
        }

        console.error('Error updating community:', error);
        // return res.status(500).send('Internal Server Error');

        return res.render('editCommunity', {
            user_id,
            communitySlug,
            community_name: '',
            description_details: '',
            communityNameError: '',
            communityDescriptionError: '',
            otherError: "An internal server error occurred."
        });
    }
}

// to delete community
exports.deleteCommunity = async (req, res) => {
    try {
        const user_id = req.session.user.user_id;
        // community name from url
        const { communitySlug } = req.params;

        // find if exist
        const community = await Community.findCommunity(communitySlug);

        // if not found 
        if (!community) {

            return res.render('showSelectedCommunity', {
                user_id,
                community: '',
                posts: '',
                isCreator: '',
                otherError: "Community cannot be found."
            });
        }

        // check if user is creator
        let creatorId = "";
        if (community.createdBy) {
            creatorId = community.createdBy.toString();
        }

        let isCreator = "";
        if (creatorId && creatorId === user_id.toString()) {
            isCreator = 'Yes';
        }

        if (!isCreator) {

            return res.render('showSelectedCommunity', {
                user_id,
                community: '',
                posts: '',
                isCreator: '',
                otherError: "You can only edit communities you created."
            });
        }

        // delete relevant posts and related post data
        const postsInCommunity = await Post.find({ communityId: community._id });
        const postIds = [];

        for (let i = 0; i < postsInCommunity.length; i++) {
            postIds.push(postsInCommunity[i]._id);
        }

        if (postIds.length > 0) {
            await Comment.deleteMany({ postId: { $in: postIds } });
            await Bookmark.deleteMany({ postId: { $in: postIds } });
            await Vote.deleteMany({ postId: { $in: postIds } });
        }

        await Post.deleteMany({ communityId: community._id });
        await Community.deleteCommunity(community._id);
        
        return res.redirect('/communities');

    } catch (error) {
        const communitySlug = req.params.communitySlug;
        console.error('Error deleting community:', error);

        return res.render('showSelectedCommunity', {
            user_id,
            community: '',
            posts: '',
            isCreator: '',
            otherError: "An internal server error occurred."
        });
    }
};
