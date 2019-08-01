const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

router.post('/signup', usersController.addUser);

router.post('/login', usersController.login);

module.exports = router;