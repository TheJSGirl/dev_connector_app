const express = require('express');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const router = express.Router();

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
      if (isMatch) {
        return res.json({ msg: 'Success' });
      }
      return res.status(400).json({ msg: 'Failed', password: 'Password incorrect' });
    });
  });
});

module.exports = router;
