const express = require('express');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

const router = express.Router();

// Load input Validation
const validateRegisterInput = require('../../validation/register');

/**
 * @route GET api/users/test
 * @desc Testes users route
 * @access Public
 */

router.get('/test', (req, res) => res.json({ msg: 'Users works' }));

/**
 * @route GET api/users/register
 * @desc Register user
 * @access Public
 */
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({
          email: 'Email already exist',
        });
      }
      const avatar = gravatar.url(req.body.email, {
        s: '200', // size
        r: 'pg', // Rating
        d: 'mm', // Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (e, hash) => {
          if (e) {
            return;
          }
          newUser.password = hash;
          newUser
            .save()
            .then(data => res.json(data))
            .catch(error => console.log(error));
        });
      });
    })
    .catch(err => console.log(err));
});

/**
 * @route POST api/users/login
 * @desc Login user /Return JWT token
 * @access Public
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // find the user by email
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) {
        return res.status(400).json({ password: 'Password incorrect' });
      }

      // user matched
      const payload = { id: user.id, name: user.name, avatar: user.avatar };

      // sign token
      jwt.sign(payload, keys.secret, { expiresIn: 3600 }, (err, token) => {
        res.json({
          success: true,
          token: `Bearer ${token}`,
        });
      });
    });
  });
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

module.exports = router;
