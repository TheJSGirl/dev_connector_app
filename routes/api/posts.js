const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

// Load models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const router = express.Router();

// Validation
const validatePostInput = require('../../validation/post');

/**
 * @route GET api/posts/test
 * @desc Testes posts route
 * @access Public
 */
router.get('/test', (req, res) => res.json({ msg: 'Posts works' }));

/**
 * @route GET api/posts
 * @desc Get posts
 * @access Public
 */
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'no post found' }));
});

/**
 * @route GET api/posts/:id
 * @desc Get single post
 * @access Public
 */
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .sort({ date: -1 })
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'no post found with that ID' }));
});

/**
 * @route DELETE api/posts/:id
 * @desc Delete  post
 * @access Public
 */
router.get('/:id', passport.authenticate('jwt, {session: false}'), (req, res) => {
  Post.findById(req.params.id)
    .sort({ date: -1 })
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'no post found with that ID' }));
});

/**
 * @route DELETE api/posts/:id
 * @desc delete post
 * @access Private
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id).then((post) => {
    if (post.user.toString() !== req.user.id) {
      return res.status(404).json({ noauthorisation: 'User not authorised' });
    }
    post.remove().then(() => res.status(200).json({ success: true }));
  });
});

module.exports = router;
