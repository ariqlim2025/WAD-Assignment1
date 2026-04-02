const Vote      = require('../models/vote');
const Post = require('../models/post');

// Controller function to add a vote to a post
exports.addVote = async (req, res) => {

    const user_id = req.session.user.user_id;

    // Read the vote data from the post that is being selected
    const vote_data = req.body;

    // console.log('vote_data: ', vote_data);
    const postId = vote_data.postId;                      // postID is equal to the post that the user voted on
    const selected_value = Number(vote_data.value);       // value > (-1 is downvote, 1 is upvote)

    // Validation - if user edits the HTML or sends via Postman
    if (selected_value !== 1 && selected_value !== -1) {
        return res.status(400).send('Invalid vote value');
    }

    // Validation - if database down / load fail
    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Check if the user has already voted on this post and what was his vote
        const existingVote = await Vote.findOneVote(user_id, postId);

        if (existingVote) {
            const current_vote = existingVote.value;

            // if he vote the different thing > update database > reload '/' page (vote will minus 2)
            if (current_vote !== selected_value) {
                // vote will minus 2
                await Vote.updateOneVote(existingVote._id, selected_value);
            }
            else {
                await Vote.deleteOneVote(existingVote._id);
            }
        }
        else {
            await Vote.createOneVote(user_id, postId, selected_value);
        }
        // res.redirect('/');
        // stay on current page instead of redirecting back to root page
        res.redirect(req.get('Referrer') || '/');

    } catch (error) {
        console.error('Error adding vote:', error);
        res.status(500).send('Internal Server Error');
    }
}

