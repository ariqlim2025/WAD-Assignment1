// const bcrypt = require('bcrypt');
const User   = require('../models/user');
const Post   = require('../models/post');
const Comment = require('../models/comment');
const Bookmark = require('../models/bookmark');
const Vote = require('../models/vote');
const Community = require('../models/community');
const fs = require('fs/promises');
const path = require('path');

const communities = path.join(__dirname, '../data/communities.json');

// Get the user ID from the session
const user_id = "69bf916c4e7188eacfdc67b0"; // hardcoded, swap to req.session.user_id once auth finish

// Controller function to add a community
exports.showCreateCommunityPage = (req, res) => {
    res.render('createCommunity', { 
        user_id,
        community_name: '',
        description_details: '',
        communityNameError: '',
        communityDescriptionError: ''
     });
}

exports.createCommunity = async (req, res) => {

    // To validate the name and the description
    const communityRegex = /^[A-Za-z0-9_]+$/;
    const descriptionRegex = /^[A-Za-z0-9_.,]+(?: [A-Za-z0-9_.,]+)*$/;

    // To store error messages
    let communityNameError = '';
    let communityDescriptionError = '';

    // Get the community name and description from the request body
    const community_name = (req.body.community ?? '').trim();
    const description_details = (req.body.description ?? '').trim();

    // validation for community name
    if (!community_name) {
        communityNameError = 'Community name is required';
    }
    else if (!communityRegex.test(community_name)) {
      communityNameError = "Community name can only contain letters, numbers and '_'";
    }
    else {
        communityNameError = '';
    }

    // validation for description details
    if (!description_details) {
        communityDescriptionError = 'Description detail is required';
    }
    else if (!descriptionRegex.test(description_details)) {
        communityDescriptionError = "Description detail can only contain letters, numbers and '_', single space, commas and full stops";
    }
    else {
        communityDescriptionError = '';
    }

    // If validation failed, re-render the same page with error messages.
    if (communityNameError || communityDescriptionError) {
        return res.render('createCommunity', {
            user_id,
            community_name,
            description_details,
            communityNameError,
            communityDescriptionError
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
                communityDescriptionError
            });
        }
        
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
            communityDescriptionError: ''
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
                communityDescriptionError
            });
        }
        // server error
        console.error('Error creating community:', error);
        return res.send(
            `<script>
                alert("An internal server error occurred.");
                window.location.href = window.location.origin + "/create-community";
            </script>`
        );
    }
}

// show all communities page
exports.showCommunitiesPage = async (req, res) => {
    const communities = await Community.allCommunities();

    res.render('showCommunity', {
        user_id,
        communities: communities
    });
}

// show the community that the user selected
exports.showSelectedCommunity = async (req, res) => {
    try {
        
        // get the community name from the url
        const { communitySlug } = req.params;

        // find if there is such community
        const selectedCommunity = await Community.findCommunity(communitySlug);

        // if no community
        if (!selectedCommunity) {
            return res.send(
                `<script>
                    alert("Community cannot be found."); 
                    window.location.href=window.location.origin + "/communities";
                </script>`
            );
        }

        // if there is community, find all related posts
        const posts = await Post.find({ communityId: selectedCommunity._id })
            .populate('authorId')
            .populate('communityId');
        
        // find all related comments also
        const comments = await Comment.find().lean();

        // for each post, count the comments in the posts
        for (let i = 0; i < posts.length; i++) {
            posts[i].author = posts[i].authorId;
            let count = 0;
            for (let k = 0; k < comments.length; k++) {
                if (comments[k].postId.toString() === posts[i]._id.toString()) {
                    count++;
                }
            }
            posts[i].commentCount = count;
        }

        // check if the user is the creator of the community, then can edit community
        const creatorId = selectedCommunity.createdBy.toString();
        
        const isCreator = (creatorId === user_id) ? 'Yes' : "";

        return res.render('showSelectedCommunity', {
            user_id,
            community: selectedCommunity,
            posts,
            isCreator
        });

        
    }
    catch(error) {
        console.error("Error loading selected community: ", error);
        return res.send(
            `<script>
                alert("An internal server error occurred.");
                window.location.href = window.location.origin + "/communities";
            </script>`
        );
    }
}

// show the edit community page
exports.showEditCommunityPage = async (req, res) => {
    try {
        // get community name from url
        const { communitySlug } = req.params;

        // find if there is such community
        const selectedCommunity = await Community.findCommunity(communitySlug);

        // if no such community
        if (!selectedCommunity) {
            return res.send(
                `<script>
                    alert("Community cannot be found.");
                    window.location.href = window.location.origin + "/communities";
                </script>`
            );
        }

        // check if user is creator of the community again
        const creatorId = selectedCommunity.createdBy.toString();
        
        const isCreator = (creatorId === user_id) ? 'Yes' : "";

        if (!isCreator) {
            return res.send(
                `<script>
                    alert("You can only edit communities you created.");
                    window.location.href = window.location.origin + "/communities/${communitySlug}";
                </script>`
            );
        }

        // if user is creator, then render the edit page
        return res.render('editCommunity', {
            user_id,
            communitySlug,
            community_name: selectedCommunity.name,
            description_details: selectedCommunity.description,
            communityNameError: '',
            communityDescriptionError: ''
        });
        
    } catch (error) {
        const { communitySlug } = req.params;
        console.error('Error loading edit community page:', error);
        return res.send(
            `<script>
                alert("An internal server error occurred.");
                window.location.href = window.location.origin + "/communities/${communitySlug}";
            </script>`
        );
    }
}

// after checking if user is the creator, then they can update the community
exports.updateCommunity = async (req, res) => {

    // check the community name and description
    const communityRegex = /^[A-Za-z0-9_]+$/;
    const descriptionRegex = /^[A-Za-z0-9_.,]+(?: [A-Za-z0-9_.,]+)*$/;

    // string to store errors
    let communityNameError = '';
    let communityDescriptionError = '';

    // the previous name is taken from the url
    const { communitySlug } = req.params;
    const oldName = communitySlug;

    // new name and description from the body 
    const community_name = (req.body.community ?? '').trim();
    const description_details = (req.body.description ?? '').trim();

    // validating the name
    if (!community_name) {
        communityNameError = 'Community name is required';
    } else if (!communityRegex.test(community_name)) {
        communityNameError = "Community name can only contain letters, numbers and '_'";
    }

    // validating the description
    if (!description_details) {
        communityDescriptionError = 'Description detail is required';
    } else if (!descriptionRegex.test(description_details)) {
        communityDescriptionError = "Description detail can only contain letters, numbers and '_', single space, commas and full stops";
    }

    try {
        // find if community exist
        const community = await Community.findCommunity(oldName);

        // if not exist
        if (!community) {
            return res.send(
                `<script>
                    alert("Community cannot be found.");
                    window.location.href = window.location.origin + "/communities/${communitySlug}";
                </script>`
            );
        }

        // check if user is creator
        const creatorId = community.createdBy.toString();
        
        const isCreator = (creatorId === user_id) ? 'Yes' : "";

        if (!isCreator) {
            return res.status(403).send('You can only edit communities you created');
        }

        // if there is any error, render the error on the page
        if (communityNameError || communityDescriptionError) {
            return res.render('editCommunity', {
                user_id,
                communitySlug,
                community_name,
                description_details,
                communityNameError,
                communityDescriptionError
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
                    communityDescriptionError: ''
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
                communityDescriptionError: ''
            });
        }

        console.error('Error updating community:', error);
        return res.status(500).send('Internal Server Error');
    }
}

// to delete community
exports.deleteCommunity = async (req, res) => {
    try {
        // community name from url
        const { communitySlug } = req.params;

        // find if exist
        const community = await Community.findCommunity(communitySlug);

        // if not found 
        if (!community) {
            return res.status(404).send('Community not found');
        }

        // check if user is creator
        const creatorId = community.createdBy.toString();
        
        const isCreator = (creatorId === user_id) ? 'Yes' : "";

        if (!isCreator) {
            return res.status(403).send('You can only delete communities you created');
        }

        // delete relevant posts and community
        // await Post.deleteMany({ communityId: community._id });
        await Community.deleteCommunity(community._id);
        return res.redirect('/communities');

    } catch (error) {
        console.error('Error deleting community:', error);
        return res.status(500).send('Internal Server Error');
    }
};