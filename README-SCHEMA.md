# Schema Documentation

## Overview

This project uses **Mongoose** (MongoDB ODM) with 6 collections that model a Reddit-style forum application. The schemas are defined in the `models/` directory, and sample seed data lives in `data/` as JSON files.

| Collection   | Model File       | Seed Data File       | Record Count |
|--------------|------------------|----------------------|--------------|
| Users        | `models/user.js` | `data/users.json`    | 12           |
| Posts        | `models/post.js` | `data/posts.json`    | 14           |
| Comments     | `models/comment.js` | `data/comments.json` | 20         |
| Communities  | `models/community.js` | `data/communities.json` | 11      |
| Bookmarks    | `models/bookmark.js` | `data/bookmarks.json` | 12        |
| Votes        | `models/vote.js` | `data/votes.json`    | 36           |

---

## Entity-Relationship Diagram

```
┌──────────────┐
│     User     │
│──────────────│
│ _id          │
│ username     │
│ email        │
│ passwordHash │
│ bio          │
│ createdAt    │
└──────┬───────┘
       │
       │ 1 ─── * (authorId)
       ├──────────────────────────┐
       │                          │
       ▼                          ▼
┌──────────────┐          ┌──────────────┐
│     Post     │          │  Community   │
│──────────────│          │──────────────│
│ _id          │          │ _id          │
│ title        │◄─────────│ name         │
│ content      │ * ── 1   │ description  │
│ authorId ──► User       │ createdBy ──► User
│ communityId ► Community │ createdAt    │
│ createdAt    │          └──────────────┘
│ updatedAt    │
└──────┬───────┘
       │
       │ 1 ─── *
       ├────────────────┬────────────────┐
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Comment    │ │   Bookmark   │ │     Vote     │
│──────────────│ │──────────────│ │──────────────│
│ _id          │ │ _id          │ │ _id          │
│ content      │ │ userId ──► User│ userId ──► User
│ authorId ──► User note      │ │ postId ──► Post
│ postId ──► Post│ postId ──► Post│ value        │
│ createdAt    │ │ createdAt    │ │ createdAt    │
│ updatedAt    │ └──────────────┘ └──────────────┘
└──────────────┘
```

---

## Schema Details

### 1. User

The central entity. Users create posts, comments, communities, bookmarks, and votes.

```js
{
    username:     { type: String, required: true, unique: true },
    email:        { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    bio:          { type: String },
    createdAt:    { type: Date, default: Date.now }
}
```

| Field          | Type     | Required | Unique | Description                    |
|----------------|----------|----------|--------|--------------------------------|
| `username`     | String   | Yes      | Yes    | Display name                   |
| `email`        | String   | Yes      | Yes    | Login email                    |
| `passwordHash` | String   | Yes      | No     | bcrypt-hashed password         |
| `bio`          | String   | No       | No     | Short profile description      |
| `createdAt`    | Date     | No       | No     | Account creation timestamp     |

**Referenced by:** Post (`authorId`), Comment (`authorId`), Community (`createdBy`), Bookmark (`userId`), Vote (`userId`)

---

### 2. Post

A piece of content submitted by a user to a community.

```js
{
    title:       { type: String, required: true },
    content:     { type: String, required: true },
    authorId:    { type: ObjectId, ref: 'User' },
    communityId: { type: ObjectId, ref: 'Community' },
    createdAt:   { type: Date, default: Date.now },
    updatedAt:   { type: Date, default: Date.now }
}
```

| Field         | Type     | Required | Ref         | Description                     |
|---------------|----------|----------|-------------|---------------------------------|
| `title`       | String   | Yes      | —           | Post headline                   |
| `content`     | String   | Yes      | —           | Post body text                  |
| `authorId`    | ObjectId | No       | `User`      | The user who wrote the post     |
| `communityId` | ObjectId | No       | `Community` | The community it belongs to     |
| `createdAt`   | Date     | No       | —           | When the post was created       |
| `updatedAt`   | Date     | No       | —           | When the post was last edited   |

**References:** User (via `authorId`), Community (via `communityId`)
**Referenced by:** Comment (`postId`), Bookmark (`postId`), Vote (`postId`)

---

### 3. Comment

A reply to a post, written by a user.

```js
{
    content:   { type: String, required: true },
    authorId:  { type: ObjectId, ref: 'User' },
    postId:    { type: ObjectId, ref: 'Post' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}
```

| Field       | Type     | Required | Ref    | Description                       |
|-------------|----------|----------|--------|-----------------------------------|
| `content`   | String   | Yes      | —      | The comment text                  |
| `authorId`  | ObjectId | No       | `User` | The user who wrote the comment    |
| `postId`    | ObjectId | No       | `Post` | The post being commented on       |
| `createdAt` | Date     | No       | —      | When the comment was created      |
| `updatedAt` | Date     | No       | —      | When the comment was last edited  |

**References:** User (via `authorId`), Post (via `postId`)

---

### 4. Community

A topic-based group that posts belong to (like a subreddit).

```js
{
    name:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    createdBy:   { type: ObjectId, ref: 'User' },
    createdAt:   { type: Date, default: Date.now }
}
```

| Field         | Type     | Required | Unique | Ref    | Description                      |
|---------------|----------|----------|--------|--------|----------------------------------|
| `name`        | String   | Yes      | Yes    | —      | Community display name           |
| `description` | String   | Yes      | No     | —      | What the community is about      |
| `createdBy`   | ObjectId | No       | No     | `User` | The user who created it          |
| `createdAt`   | Date     | No       | No     | —      | When the community was created   |

**References:** User (via `createdBy`)
**Referenced by:** Post (`communityId`)

---

### 5. Bookmark

Allows a user to save a post for later, optionally with a personal note.

```js
{
    userId:    { type: ObjectId, ref: 'User' },
    postId:    { type: ObjectId, ref: 'Post' },
    note:      { type: String },
    createdAt: { type: Date, default: Date.now }
}
```

| Field       | Type     | Required | Ref    | Description                      |
|-------------|----------|----------|--------|----------------------------------|
| `userId`    | ObjectId | No       | `User` | The user who bookmarked          |
| `postId`    | ObjectId | No       | `Post` | The post that was bookmarked     |
| `note`      | String   | No       | —      | Optional personal note           |
| `createdAt` | Date     | No       | —      | When the bookmark was created    |

**References:** User (via `userId`), Post (via `postId`)

---

### 6. Vote

An upvote (+1) or downvote (-1) on a post by a user.

```js
{
    userId:    { type: ObjectId, ref: 'User' },
    postId:    { type: ObjectId, ref: 'Post' },
    value:     { type: Number },
    createdAt: { type: Date, default: Date.now }
}
```

| Field       | Type     | Required | Ref    | Description                              |
|-------------|----------|----------|--------|------------------------------------------|
| `userId`    | ObjectId | No       | `User` | The user who voted                       |
| `postId`    | ObjectId | No       | `Post` | The post being voted on                  |
| `value`     | Number   | No       | —      | `1` for upvote, `-1` for downvote        |
| `createdAt` | Date     | No       | —      | When the vote was cast                   |

**References:** User (via `userId`), Post (via `postId`)

---

## How the Schemas Interact

### Relationship Summary

```
User ──1:*──► Post          A user authors many posts
User ──1:*──► Comment       A user authors many comments
User ──1:*──► Community     A user can create many communities
User ──1:*──► Bookmark      A user can bookmark many posts
User ──1:*──► Vote          A user can vote on many posts

Community ──1:*──► Post     A community contains many posts

Post ──1:*──► Comment       A post can have many comments
Post ──1:*──► Bookmark      A post can be bookmarked by many users
Post ──1:*──► Vote          A post can receive many votes
```

### Interaction Flows

**Creating a Post:**
A `User` writes a `Post` inside a `Community`. The post stores the user's ID in `authorId` and the community's ID in `communityId`.

**Commenting on a Post:**
A `User` writes a `Comment` on a `Post`. The comment stores the user's ID in `authorId` and the post's ID in `postId`.

**Voting on a Post:**
A `User` casts a `Vote` on a `Post`. The `value` field is `1` (upvote) or `-1` (downvote). A post's score is the sum of all its vote values.

**Bookmarking a Post:**
A `User` saves a `Post` as a `Bookmark` with an optional personal `note` for context.

**Creating a Community:**
A `User` creates a `Community`. The community stores the creator's ID in `createdBy`.

---

## Mongoose Usage Examples

### Populating References

Mongoose `ref` fields allow you to use `.populate()` to replace IDs with full documents.

**Get a post with its author and community:**

```js
const post = await Post.findById('p001')
    .populate('authorId')
    .populate('communityId');

// post.authorId is now the full User document
// post.communityId is now the full Community document
console.log(post.authorId.username);   // "TheMonster112"
console.log(post.communityId.name);    // "WAD Discussion"
```

**Get all comments on a post with author info:**

```js
const comments = await Comment.find({ postId: 'p001' })
    .populate('authorId');

comments.forEach(c => {
    console.log(`${c.authorId.username}: ${c.content}`);
});
```

**Get all bookmarks for a user with post details:**

```js
const bookmarks = await Bookmark.find({ userId: 'u001' })
    .populate('postId');

bookmarks.forEach(b => {
    console.log(`${b.postId.title} — Note: ${b.note}`);
});
```

### Aggregation Queries

**Calculate a post's vote score:**

```js
const result = await Vote.aggregate([
    { $match: { postId: mongoose.Types.ObjectId('p001') } },
    { $group: { _id: '$postId', score: { $sum: '$value' } } }
]);
// result[0].score = 3
```

**Count comments per post:**

```js
const counts = await Comment.aggregate([
    { $group: { _id: '$postId', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]);
```

**Get a community's posts with vote scores:**

```js
const posts = await Post.find({ communityId: 'com001' })
    .populate('authorId');

for (const post of posts) {
    const votes = await Vote.aggregate([
        { $match: { postId: post._id } },
        { $group: { _id: null, score: { $sum: '$value' } } }
    ]);
    console.log(`${post.title} — Score: ${votes[0]?.score || 0}`);
}
```

---

## Seed Data Reference

The `data/` folder contains JSON files with sample data that mirrors the schema structure. These use string IDs (e.g., `"u001"`, `"p001"`) instead of MongoDB ObjectIds, making them suitable for development and testing before connecting to a real database.

| File                  | IDs Used         | Count | Notes                                 |
|-----------------------|------------------|-------|---------------------------------------|
| `users.json`          | `u001` – `u012`  | 12    | Passwords are placeholder hashes      |
| `posts.json`          | `p001` – `p014`  | 14    | Span 11 different communities         |
| `comments.json`       | `c001` – `c020`  | 20    | Spread across 12 of the 14 posts      |
| `communities.json`    | `com001` – `com011` | 11 | Created by 8 different users          |
| `bookmarks.json`      | `b001` – `b012`  | 12    | 7 unique users bookmarking 10 posts   |
| `votes.json`          | `v001` – `v036`  | 36    | Mix of upvotes (33) and downvotes (3) |
