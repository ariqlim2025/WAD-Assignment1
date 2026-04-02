// models/Community.js
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt:   { type: Date, default: Date.now }
});

const Community = mongoose.model('Community', communitySchema);

exports.findCommunityById = function(communityId) {
    return Community.findOne({ _id: communityId });
};

exports.createCommunity = function(newCommunity) {
    return Community.create(newCommunity);
};

exports.findCommunity = function(community_name) {
    return Community.findOne({ name: community_name });
};

exports.allCommunities = function() {
    return Community.find();
};

exports.updateCommunityDetails = function(communityId, updates) {
    return Community.updateOne(
        { _id: communityId },
        { $set: updates }
    );
};

exports.deleteCommunity = function(communityId) {
    return Community.deleteOne({ _id: communityId });
};
