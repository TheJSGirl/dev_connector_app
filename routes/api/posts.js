const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Post = require('../../models/Post');

const router = express.Router();

/**
 * @route GET api/posts/test
 * @desc Testes posts route
 * @access Public
 */
router.get('/test', (req, res) => res.json({ msg: 'Posts works' }));

/**
 * @route POST api/posts/
 * @desc create post
 * @access Private
 */
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id,
  });

  newPost
    .save()
    .then(post => res.status(200).json(post))
    .catch(err => res.json(err));
});

module.exports = router;
