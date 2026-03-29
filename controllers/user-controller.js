const bcrypt = require('bcrypt');
const User   = require('../models/user');
const Post   = require('../models/post');
const Comment = require('../models/comment');
const Bookmark = require('../models/bookmark');

exports.showRegister = async (req, res) => {
    res.render("register", {
        usernameError: undefined, 
        emailError: undefined, 
        passError: undefined,
        ageError: undefined,
        username: undefined,
        email: undefined,
        dateBirth: undefined
    });
};

exports.handleRegister = async (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let conf_password = req.body.confirmPassword;
    let dateBirth = req.body.dateBirth;

    // Initialise error message variables
    let usernameError = '';
    let emailError = '';
    let passError = '';
    let ageError = '';

    // Get birth date and current date for calculating age
    let [bYear, bMonth, bDay] = dateBirth.split('-');
    birthDate = new Date(parseInt(bYear), parseInt(bMonth)-1, parseInt(bDay));
    currDate = new Date();

    // Gets age and checks for date if birthday has passed
    let age = currDate.getFullYear() - birthDate.getFullYear();
    let monthDiff = currDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currDate.getDate() < birthDate.getDate())) { age--; }
    if (age < 13) { ageError = '<li>You must be 13 and above to use the app!</li>'; }

    // Check if password and confirm password matches, else send error message
    if (password != conf_password) {
        passError = '<li>Passwords do not match</li>';
        
        return res.render('register', {
            usernameError, 
            emailError, 
            passError,
            ageError,
            username,
            email,
            dateBirth
        });
    }

    let isPassValid;
    [isPassValid, passError] = validPassword(password);

    // Return error messages if validation fails
    if (!isPassValid) {
        return res.render('register', {
            usernameError, 
            emailError, 
            passError,
            ageError,
            username,
            email,
            dateBirth
        });
    }

    // Username & Email validation
    const existingUsername = await User.findByUsername(username);
    const existingEmail = await User.findByEmail(email);

    if (existingUsername) { usernameError = '<li>Username already exists</li>'; }
    if (existingEmail) { emailError = '<li>Email already exists</li>'; }

    if (existingUsername || existingEmail) {
        return res.render('register', {
            usernameError,
            emailError,
            passError,
            ageError,
            username,
            email,
            dateBirth
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    User.addUser(username, email, passwordHash, age);
    res.redirect('/')
};

exports.showLogin = async (req, res) => {
    console.log(req.session.user)
    res.render("login", { loginCred: undefined, loginMsg: undefined });
};

exports.handleLogin = async (req, res) => {
    // loginCred can be either username or email
    let loginCred = req.body.loginCred;
    let password = req.body.password;

    // Regular expression check for email format
    let emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let userCreds = emailCheck.test(loginCred) ? await User.findByEmail(loginCred) : await User.findByUsername(loginCred);
    let match = userCreds ? await bcrypt.compare(password, userCreds.passwordHash) : null;
    let loginMsg = !match ? 'Incorrect username or password' : '';

    if (userCreds && match) {
        req.session.user = {
            user_id: userCreds._id,
            username: userCreds.username
        };
    }

    if (req.session.user) { return res.redirect('/'); }
    res.render("login", { loginCred, loginMsg });
}

function validPassword(password) {
    let errors = '';

    // Min/Max characters
    let minChars = 8;
    let maxChars = 16;

    // Regular expression checks for password requirements
    let upperCheck = /^(?=.*[A-Z]).+$/;
    let lowerCheck = /^(?=.*[a-z]).+$/;
    let specialCheck = /^(?=.*[!@#$%^&*]).+$/;
    let numCheck = /^(?=.*[0-9]).+$/;
    let validCharsCheck = /^[a-zA-Z0-9!@#$%^&*]+$/;

    // Checks on password
    if (minChars > password.length || password.length > maxChars) { errors += '<li>Password should be between 8 to 16 characters</li>'; }
    if (!upperCheck.test(password)) { errors += '<li>Password should contain at least one uppercase character</li>'; } 
    if (!lowerCheck.test(password)) { errors += '<li>Password should contain at least one lowercase character</li>'; } 
    if (!specialCheck.test(password)) { errors += '<li>Password should contain at least one special character (!@#$%^&*)</li>'; } 
    if (!numCheck.test(password)) { errors += '<li>Password should contain at least one number</li>'; }
    if (!validCharsCheck.test(password)) { errors += '<li>Password contains invalid characters</li>'; }

    // If there are errors then return false (failed validation (incl. username & email)) & error strings
    if (errors) {
        return [false, errors];
    }
    else {
        return [true, errors];
    }
}