// app.js

const express = require('express');
const { connectToDb, getDb } = require('./db');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

let db;

connectToDb((err) => {
  if (err) {
    console.error('Error occurred while connecting to the database:', err);
    return;
  }
  console.log('Connected successfully to the database');

  app.listen(3000, () => {
    console.log('App listening on port 3000');
  });

  db = getDb();
});

app.get('/display', (req, res) => {
  if (!db) {
    return res.status(500).send('Database not connected');
  }

  db.collection('books')
    .find()
    .toArray()
    .then((books) => {
      res.send(books);
    })
    .catch((err) => {
      console.error('Error fetching documents:', err);
      res.status(500).send('Could not fetch the documents');
    });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/addbook.html');
});

app.post('/add-book', (req, res) => {
  if (!db) {
    return res.status(500).send('Database not connected');
  }

  const { title, author, genres, rating } = req.body;
  const genreArray = genres.split(',').map(genre => genre.trim());

  db.collection('books').insertOne({
    book_name: title,
    author,
    genre: genreArray,
    rating: parseInt(rating)
  })
  .then(() => {
    res.redirect('/');
  })
  .catch((err) => {
    console.error('Error inserting document:', err);
    res.status(500).send('Could not insert the document');
  });
});

module.exports = app;
