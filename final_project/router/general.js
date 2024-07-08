const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

async function getBooks() {
  return books;
}

async function getBookByISBN(isbn) {
  return books[isbn];
}

async function getBooksByAuthor(author) {
  const bookISBNs = Object.keys(books);

  const filteredBookISBNs = bookISBNs.filter(
    (bookISBN) => books[bookISBN].author === author
  );

  const booksWithAutor = {};
  filteredBookISBNs.forEach((bookISBN) => {
    booksWithAutor[bookISBN] = books[bookISBN];
  });
  return booksWithAutor;
}

async function getBooksByTitle(title) {
  const bookISBNs = Object.keys(books);

  const filteredBookISBNs = bookISBNs.filter(
    (bookISBN) => books[bookISBN].title === title
  );

  const booksWithTitle = {};
  filteredBookISBNs.forEach((bookISBN) => {
    booksWithTitle[bookISBN] = books[bookISBN];
  });
  return booksWithTitle;
}

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBooks()
    .then((response) => {
      return res.send(response);
    })
    .catch((error) => {
      return res.status(500).send(error);
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (isbn) {
    getBookByISBN(isbn).then((book) => {
      return res.send(book);
    });
    res.status(400).send("Book with ISBN does not exist!");
  }

  return res.status(400).send("No isbn given!");
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  if (!author) return res.status(400).send("No author given!");

  getBooksByAuthor(author).then((books) => {
    return res.send(books);
  });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title;

  if (!title) return res.status(400).send("No title given!");

  getBooksByTitle(title).then((books) => {
    return res.send(books);
  });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (isbn) {
    const book = books[isbn];

    if (book) return res.send(book.reviews);
    res.status(400).send("Book with ISBN does not exist!");
  }

  return res.status(400).send("No isbn given!");
});

module.exports.general = public_users;
