const express = require('express');

const port = process.env.PORT || 5000;
const mongoose = require('mongoose');

const app = express();

// DB config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose.connect(db);
mongoose.connection.once('open', () => {
  console.log('connected to database');
});

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
