const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const router = express.Router();

// Load profile model
const Profile = require('../../models/Profile');

// Load user profile
const User = require('../../models/User');

/**
 * @route GET api/profile/test
 * @desc Testes profile route
 * @access Public
 */

router.get('/test', (req, res) => res.json({ msg: 'Profile works' }));

/**
 * @route GET api/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'There is no profile';
        return res.status(404).json(errors);
      }
      res.status(200).json(profile);
    })
    .catch(err => console.log(err));
});
module.exports = router;
