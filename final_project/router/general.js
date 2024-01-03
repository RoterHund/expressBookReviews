const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
  });

public_users.get('/', function (req, res) {
    const get_books = new Promise((resolve, reject) => {
        if (books) {
            resolve(res.send(JSON.stringify({ books }, null, 4)));
        }
        reject(res.send("Books not found"));  
    });

    get_books.then(() => {
        console.log("Promise resolved");
    }).catch((error) => {
        res.status(404).send(error); // Sending an error response if books don't exist
    });
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const get_isbn = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(res.send(books[isbn]));
        } else {
            reject(res.send(`Book with ISBN ${isbn} not found!`));
        }
    });

    get_isbn
        .then(() => {
            console.log("Promise resolved");
        })
        .catch((error) => {
            res.status(404).send(error);
        });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksbyauthor = [];
    let found = false;

    const get_author = new Promise((resolve, reject) => {
        for (let key in books) {
            if (books[key].author === author) {
                booksbyauthor.push(books[key]);
                found = true;
            }
        }

        if (found) {
            resolve(res.send(JSON.stringify({ booksbyauthor }, null, 4)));
        } else {
            reject(res.send(`The author ${author} was not found!`));
        }
    });

    get_author.then(() => {
        console.log("Promise resolved");
    }).catch((error) => {
        res.status(404).send(error);
    });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let titlesbyauthor = [];
    let found = false;

    const get_title = new Promise((resolve, reject) => {
        for (let key in books) {
            if (books[key].title === title) {
                titlesbyauthor.push(books[key]);
                found = true;
            }
        }

        if (found) {
            resolve(res.send(JSON.stringify({ titlesbyauthor }, null, 4)));
        } else {
            reject(res.send(`The title ${title} was not found!`));
        }
    });

    get_title.then(() => {
        console.log("Promise resolved");
    }).catch((error) => {
        res.status(404).send(error);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]){
    res.send(books[isbn].reviews)
  }
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
