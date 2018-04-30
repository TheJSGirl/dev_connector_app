const express = require('express');
const passport = require('passport');

const router = express.Router();

// Load profile model
const Profile = require('../../models/Profile');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

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
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'There is no profile';
        return res.status(404).json(errors);
      }
      res.status(200).json(profile);
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json(err);
    });
});

/**
 * @route GET api/profile/all
 * @desc Get all profiles
 * @access Public
 */
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then((profiles) => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json(err));
});

/**
 * @route GET api/profile/handle/:handle
 * @desc Get profile by handle
 * @access Public
 */

router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

/**
 * @route GET api/profile/user/:user_id
 * @desc Get profile by user ID
 * @access Public
 */

router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

/**
 * @route POST api/profile
 * @desc Create or edit user profile
 * @access Private
 */
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  // check validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }
  // Get fields
  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.location;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

  // Skills - Spilt into array
  if (typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }

  // Social
  profileFields.social = {};
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedIn) profileFields.social.linkedIn = req.body.linkedIn;

  Profile.findOne({ user: req.user.id }).then((profile) => {
    if (profile) {
      // update
      Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true }).then(profile => res.json(profile));
    } else {
      // create

      // check if handle exist
      Profile.findOne({ handle: profileFields.handle }).then((profile) => {
        const errors = {};
        if (profile) {
          errors.handle = 'That handle already exists';
          res.status(400).json(errors);
        }

        // Save Profile
        new Profile(profileFields).save().then(profile => res.json(profile));
      });
    }
  });
});

/**
 * @route GET api/profile/experience
 * @desc Add experience to profile
 * @access Private
 */
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  // check validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };

      // add to experience array
      profile.experiences.unshift(newExp);

      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err));
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

/**
 * @route GET api/profile/education
 * @desc Add education to profile
 * @access Private
 */
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);

  // check validation
  if (!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        // current: req.body.current,
        description: req.body.description,
      };

      // add to experience array
      profile.education.unshift(newEdu);
      // profile.education = {
      //   newEdu,
      // };

      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err));
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

/**
 * @route DELETE api/profile/experience/:exp_id
 * @desc DELETE experience from profile
 * @access Private
 */

router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        // Get remove index
        const removeIndex = profile.experiences.map(item => item.id).indexOf(req.params.exp_id);

        // Splice out of array
        profile.experiences.splice(removeIndex, 1);

        // save
        profile.save().then(profile => res.json(profile));
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  },
);

/**
 * @route DELETE api/profile/education/:edu_id
 * @desc DELETE education from profile
 * @access Private
 */

router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // save
        profile.save().then(profile => res.json(profile));
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  },
);
module.exports = router;
