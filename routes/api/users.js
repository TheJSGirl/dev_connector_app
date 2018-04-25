const express = require('express');

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

module.exports = router;
