const fs = require('fs/promises');

// Controller function to list home page
exports.showPosts = (req, res) => {
    console.log('here');
    // render displayposts (homepage)
    res.render('displayposts', {

    });
}