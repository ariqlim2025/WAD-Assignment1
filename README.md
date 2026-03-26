# G12IS113-GROUP2-ASSIGNMENT

---

# A) Steps to Set-Up Application 🚀

## Step 1: Install Dependences

```
npm install
```

## Step 2: Configure config.env

```
DB =  mongodb+srv://ariqlim2025:QfEsv7sh3Wu0glfX@waddev.vczezcr.mongodb.net/WAD-Assignment-Group2?appName=WADDev&retryWrites=true&w=majority
```
---

# B) Steps to Run the Application 🏃

## Step 1: Run server.js
```
nodemon server.js
```

## Step 2: Access the Application
```
http://localhost:8000
```
---

# C) Navigate Routes 🚏
### All users
| Route | Page | Comments |
|---|---|---|
| / | homepage.ejs | home dashboard of all posts |
| /register | register.ejs | register a new user |
| /login | login.ejs | login to an account |
| /community | community.ejs | view all sub-community posts |

### Users with account authorization
<ul><b>Test Username: <u>Manoj</u></b></ul>
<ul><b>Test Password: <u>IsTheGoat</u></b></ul>

| Route | Page | Comments |
|---|---|---|
| / | homepage.ejs | home dashboard of all posts. Authorized users can upvote/downvote |
| /profile | profile.ejs | view and update own's profile |
| /community | community.ejs | create and delete own's sub-community |