const bcrypt = require('bcrypt');
const User   = require('../models/user');

exports.showRegister = async (req, res) => {
    if (req.session.user && req.session.user.user_id) {
        return res.redirect('/');
    }

    res.render("register", {
        usernameError: undefined, 
        emailError: undefined, 
        passError: undefined,
        ageError: undefined,
        username: undefined,
        email: undefined,
        dateBirth: undefined,
        success: undefined
    });
};

exports.handleRegister = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const conf_password = req.body.confirmPassword;
    const dateBirth = req.body.dateBirth;

    // Initialise error message variables
    let usernameError = '';
    let emailError = '';
    let passError = '';
    let ageError = '';
    let success = false;

    if (!dateBirth || dateBirth.indexOf('-') === -1) {
        ageError = '<li>Date of birth is required</li>';
        return res.render('register', {
            usernameError,
            emailError,
            passError,
            ageError,
            username,
            email,
            dateBirth,
            success
        });
    }

    // Get birth date and current date for calculating age
    let [bYear, bMonth, bDay] = dateBirth.split('-');
    const birthDate = new Date(parseInt(bYear), parseInt(bMonth)-1, parseInt(bDay));
    const currDate = new Date();

    // Gets age and checks for date if birthday has passed
    let age = currDate.getFullYear() - birthDate.getFullYear();
    let monthDiff = currDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && currDate.getDate() < birthDate.getDate())) { age--; }
    if (age < 13) { ageError = '<li>You must be 13 and above to use the app!</li>'; }

    if (ageError) {
        return res.render('register', {
            usernameError,
            emailError,
            passError,
            ageError,
            username,
            email,
            dateBirth,
            success
        });
    }

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
            dateBirth,
            success
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
            dateBirth,
            success
        });
    }

    let isUsernameValid;
    [isUsernameValid, usernameError] = validUsername(username);
    
    if (!isUsernameValid) {
        return res.render('register', {
            usernameError, 
            emailError, 
            passError,
            ageError,
            username,
            email,
            dateBirth,
            success
        });
    }

    let isEmailValid;
    [isEmailValid, emailError] = validEmail(email);

    if(!isEmailValid) {
        return res.render('register', {
            usernameError, 
            emailError, 
            passError,
            ageError,
            username,
            email,
            dateBirth,
            success
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
            dateBirth,
            success
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.addUser(username, email, passwordHash, age);
    success = true;

    res.render('register', {
        usernameError,
        emailError,
        passError,
        ageError,
        username,
        email,
        dateBirth,
        success
    });
};

exports.showLogin = async (req, res) => {
    if (req.session.user && req.session.user.user_id) {
        return res.redirect('/');
    }

    res.render("login", { loginCred: undefined, loginMsg: undefined });
};

exports.handleLogin = async (req, res) => {
    // loginCred can be either username or email
    const loginCred = req.body.loginCred;
    const password = req.body.password;

    // Regular expression check for email format
    const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
};

exports.showProfile = async (req, res) => {
    const user_id = req.session.user.user_id;
    const userCreds = await User.findByID(user_id);

    if (!userCreds) {
        req.session.destroy(function() {
            res.redirect('/login');
        });
        return;
    }

    let username = userCreds.username;
    let email = userCreds.email;
    let bio = userCreds.bio;

    res.render('profile', {
        username, 
        email, 
        bio,
        userError: undefined,
        emailError: undefined,
        updated: false
    });
};

exports.handleProfile = async (req, res) => {
    const user_id = req.session.user.user_id;
    const userCreds = await User.findByID(user_id);

    if (!userCreds) {
        req.session.destroy(function() {
            res.redirect('/login');
        });
        return;
    }

    // Current values
    let username = userCreds.username;
    let email = userCreds.email;
    let bio = userCreds.bio;

    // Checkboxes
    const usernameCheck = req.body.usernameCheck;
    const emailCheck = req.body.emailCheck;
    const bioCheck = req.body.bioCheck;
    
    // Input fields
    const new_username = req.body.username;
    const new_email = req.body.email;
    const new_bio = req.body.bio;

    // Checks if username or email exists
    let userError, emailError;

    if (usernameCheck) {
        let isUsernameValid;
        [isUsernameValid, userError] = validUsername(new_username);
        const existingUser = isUsernameValid ? await User.findByUsername(new_username) : null;

        if (existingUser && existingUser._id.toString() !== user_id.toString()) {
            userError = '<li>Username already exists</li>';
        }
    }

    if (emailCheck) {
        let isEmailValid;
        [isEmailValid, emailError] = validEmail(new_email);
        const existingEmail = isEmailValid ? await User.findByEmail(new_email) : null;

        if (existingEmail && existingEmail._id.toString() !== user_id.toString()) {
            emailError = '<li>Email already exists</li>';
        }
    }

    // If error then render
    if (userError || emailError) {
        return res.render('profile', {
            username, 
            email, 
            bio, 
            userError, 
            emailError,
            updated: false
        });
    }
    
    // Update values if they're checked
    if (usernameCheck) { username = new_username ; }
    if (emailCheck) { email = new_email ; }
    if (bioCheck) { bio = new_bio ; }

    // Updates values in DB
    await User.updateDetails(user_id, email, username, bio);
    res.render('profile', {
        username, 
        email, 
        bio, 
        userError, 
        emailError,
        updated: true
    });
};

exports.showForget = async (req, res) => {
    const email = req.query.email;
    let emailError = '';
    let emailExists = false;

    // If no email in query, means user just entered the page
    if (!email) { 
        return res.render('forgetPass', { 
            email,
            emailExists,
            emailError,
            passError: undefined,
            password: undefined
        }); 
    }

    // Find if email exists, if doesn't then display email error msg
    const existingEmail = await User.findByEmail(email);
    if (!existingEmail) {
        emailError = "Email does not exist";

        return res.render('forgetPass', {
            email,
            emailExists,
            emailError,
            passError: undefined,
            password: undefined
        });
    } else {
        emailExists = true;
    }
    
    res.render('forgetPass', { 
        email,
        emailExists,
        emailError,
        passError: undefined,
        password: undefined
     });
};

exports.handlePass = async (req, res) => {
    const email = req.body.email;
    const emailExists = true;
    const password = req.body.password;
    const conf_password = req.body.confirmPassword;
    const userCreds = await User.findByEmail(email);
    let passError = '';

    if (!userCreds) {
        return res.render('forgetPass', {
            email,
            emailExists: false,
            emailError: 'Email does not exist',
            passError: undefined,
            password: undefined
        });
    }

    // Checks if password field has any input (if none means user just passed GET form)
    if (!password) {
        return res.render('forgetPass', {
            email, 
            emailExists,
            emailError: undefined,
            passError,
            password
        })
    }

    // Checks if password and confirm password match
    if (password !== conf_password) {
        passError = '<li>Passwords do not match</li>';
        
        return res.render('forgetPass', {
            email, 
            emailExists,
            emailError: undefined,
            passError,
            password
        })
    }

    // Validate password
    let isPassValid;
    [isPassValid, passError] = validPassword(password);

    if (!isPassValid) {
        return res.render('forgetPass', { 
            email, 
            emailExists,
            emailError: undefined,
            passError,
            password
        });
    }

    const matchPrevious = await bcrypt.compare(password, userCreds.passwordHash);
    
    if (matchPrevious) {
        passError = '<li>New password cannot be the same as the old password, u dummy!</li>';

        return res.render('forgetPass', { 
            email, 
            emailExists,
            emailError: undefined,
            passError,
            password
        });
    }
    
    // Get ID and hashed password
    const user_id = userCreds._id;
    const passwordHash = await bcrypt.hash(password, 10);

    // Update DB with new password
    await User.updatePassword(user_id, passwordHash);
    
    res.render('forgetPass', { 
        email, 
        emailExists,
        emailError: undefined,
        passError,
        password
    });
};

exports.showDelete = (req, res) => {
    res.render('deleteAccount', { passError: undefined, accountDeleted: undefined });
}

exports.handleDelete = async (req, res) => {
    const user_id = req.session.user.user_id;
    const password = req.body.password;
    const userCreds = await User.findByID(user_id);
    let passError = '';
    let accountDeleted = false;

    if (!userCreds) {
        req.session.destroy(function() {
            res.redirect('/login');
        });
        return;
    }

    // Comparing input field with user password
    const match = await bcrypt.compare(password, userCreds.passwordHash);

    // If don't match, flag out and display error msg
    if (!match) {
        passError = 'Password is incorrect';
        return res.render('deleteAccount', { passError, accountDeleted });
    }

    // Delete user account
    console.log('deleting account...')
    await User.deleteUser(user_id)
    req.session.destroy(function() {});
    accountDeleted = true;

    res.render('deleteAccount', { passError, accountDeleted });
}

exports.handleLogout = async (req, res) => {
    req.session.destroy(function() {
        res.redirect('/login');
    });
}

function validUsername(username) {
    let errors = '';
    
    // Regular expression check for username format (only letters, numbers and underscores)
    let validCharsCheck = /^[a-zA-Z0-9_]+$/;
    if (!validCharsCheck.test(username)) { errors += '<li>Username can only contain letters, numbers and underscores</li>'; }

    if (errors) { return [false, errors]; }
    else { return [true, errors]; }
}

function validEmail(email) {
    let errors = '';

    // Regular expression check for email format
    let emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailCheck.test(email)) { errors += '<li>Email must have a full domain (example@domain.com)</li>'; }

    if (errors) { return [false, errors]; }
    else { return [true, errors]; }
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
