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

    const communityRegex = /^[A-Za-z0-9_]+$/;
    const descriptionRegex = /^[A-Za-z0-9_.,]+(?: [A-Za-z0-9_.,]+)*$/;

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
        // `unique: true` on `name` also protects you at the DB level.
        const existingCommunity = await Community.findOne({ name: community_name });
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

        await Community.create({
            name: community_name,
            description: description_details,
            createdBy: user_id // optional; Mongoose can cast this to ObjectId if it matches
        });

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

        console.error('Error creating community:', error);
        return res.status(500).send('Internal Server Error');
    }
}

exports.showCommunitiesPage = async (req, res) => {
    const communities = await Community.find();

    res.render('showCommunity', {
        user_id,
        communities: communities
    });
}

exports.showSelectedCommunity = async (req, res) => {
    try {
        const { communitySlug } = req.params;

        const selectedCommunity = await Community.findOne({
            name: communitySlug
        });

        if (!selectedCommunity) {
            return res.status(404).send('Community not found');
        }
        const posts = await Post.find({ communityId: selectedCommunity._id })
            .populate('authorId')
            .populate('communityId');
        const comments = await Comment.find().lean();

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
        return res.status(500).send("Internal Server Error");
    }
}

exports.showEditCommunityPage = async (req, res) => {
    try {
        const { communitySlug } = req.params;

        const selectedCommunity = await Community.findOne({
            name: communitySlug
        });

        if (!selectedCommunity) {
            return res.status(404).send('Community not found');
        }

        const creatorId = selectedCommunity.createdBy.toString();
        
        const isCreator = (creatorId === user_id) ? 'Yes' : "";

        if (!isCreator) {
            return res.status(403).send('You can only edit communities you created');
        }
        return res.render('editCommunity', {
            user_id,
            communitySlug,
            community_name: selectedCommunity.name,
            description_details: selectedCommunity.description,
            communityNameError: '',
            communityDescriptionError: ''
        });
        
    } catch (error) {
        console.error('Error loading edit community page:', error);
        return res.status(500).send('Internal Server Error');
    }
}

exports.updateCommunity = async (req, res) => {

    const communityRegex = /^[A-Za-z0-9_]+$/;
    const descriptionRegex = /^[A-Za-z0-9_.,]+(?: [A-Za-z0-9_.,]+)*$/;

    let communityNameError = '';
    let communityDescriptionError = '';

    const { communitySlug } = req.params;
    const oldName = communitySlug;

    const community_name = (req.body.community ?? '').trim();
    const description_details = (req.body.description ?? '').trim();

    if (!community_name) {
        communityNameError = 'Community name is required';
    } else if (!communityRegex.test(community_name)) {
        communityNameError = "Community name can only contain letters, numbers and '_'";
    }

    if (!description_details) {
        communityDescriptionError = 'Description detail is required';
    } else if (!descriptionRegex.test(description_details)) {
        communityDescriptionError = "Description detail can only contain letters, numbers and '_', single space, commas and full stops";
    }

    try {
        const community = await Community.findOne({ name: oldName });

        if (!community) {
            return res.status(404).send('Community not found');
        }

        const creatorId = community.createdBy.toString();
        
        const isCreator = (creatorId === user_id) ? 'Yes' : "";

        if (!isCreator) {
            return res.status(403).send('You can only edit communities you created');
        }

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
        if (community_name !== community.name) {
            const taken = await Community.findOne({ name: community_name });
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
        community.name = community_name;
        community.description = description_details;
        await community.save();
        const newSlug = community_name;
        return res.redirect(`/communities/${newSlug}`);

    } catch (error) {
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

exports.deleteCommunity = async (req, res) => {
    try {
        const { communitySlug } = req.params;

        const community = await Community.findOne({ name: communitySlug });

        if (!community) {
            return res.status(404).send('Community not found');
        }

        const creatorId = community.createdBy.toString();
        
        const isCreator = (creatorId === user_id) ? 'Yes' : "";

        if (!isCreator) {
            return res.status(403).send('You can only delete communities you created');
        }

        // await Post.deleteMany({ communityId: community._id });
        await Community.deleteOne({ _id: community._id });
        return res.redirect('/communities');

    } catch (error) {
        console.error('Error deleting community:', error);
        return res.status(500).send('Internal Server Error');
    }
};