const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return false;
    } else {
      return true;
    }
  }

const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
  }

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).send(`Book with ISBN ${isbn} not found.`);
    } else {
        const reviews = books[isbn].reviews; 

        // Update or add the review for the user
        reviews[username] = review;
        books[isbn].reviews = reviews;

        // Send a success message back to the client
        return res.status(200).send(`Review for book with ISBN ${isbn} updated/added by ${username}.`);
    }
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Fix typo

    if (!books[isbn]) {
        return res.status(404).send(`Book with ISBN ${isbn} not found.`);
    } else {
        const reviews = books[isbn].reviews;

        if (!reviews[username]) {
            return res.status(404).send(`Review for book with ISBN ${isbn} not found for user ${username}.`);
        }

        // Remove the review for the specific user
        const updatedReviews = Object.fromEntries(
            Object.entries(reviews).filter(([key]) => key !== username)
        );

        // Send a success message back to the client
        books[isbn].reviews = updatedReviews;
        return res.status(200).send(`Review for book with ISBN ${isbn} deleted for user ${username}.`);
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
