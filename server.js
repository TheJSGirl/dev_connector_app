const express = require('express');

const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

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

// Use Routes
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
