const express = require('express');
const router = express.Router();

// import middlewares
const { requireSignin, authMiddleware, } = require('../controllers/auth');

// import controllers
const { read } = require('../controllers/user');

// routes
router.get('/user', requireSignin, authMiddleware, read);

module.exports = router;
