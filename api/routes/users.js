const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.findOne({ username: req.body.username })
    .then((foundUser) => {
        if (foundUser) {
            res.status(409).json({
                message: 'user with given name already exists'
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    res.status(500).json({
                        error: err
                    })
                } else {
                    User.create(
                        {
                            'username': req.body.username, 
                            'password': hash
                        }
                    ).then(() => {
                        res.status(201).json({
                            message: 'user created'
                        });
                    })
                    .catch((err) => {
                        res.status(400).json({
                            err: err,
                            message: 'not valid email'
                        });
                    });
                }
            }); 
        }
    })
    .catch(() => {
        res.status(500).json({
            message: 'something went wrong'
        })
    });
});

router.post('/login', (req, res, next) => {
    User.findOne({ username: req.body.username })
    .then(foundUser => {
        console.log(foundUser);
        if (foundUser) {
            bcrypt.compare(req.body.password, foundUser.password, (err, result) => {
                if (result) {
                    const token = jwt.sign(
                        { userId: foundUser._id },
                        'superpuperduperkey',
                        {
                            expiresIn: '1h'
                        }
                    );
                    res.status(200).json({
                        message: 'Auth successful',
                        tokenForTest: token
                    });
                } else {
                    res.status(401).json({
                        message: 'Auth failed'
                    });
                } 
            });
        } else {
            res.status(401).json({
                message: 'Auth failed'
            });
        }
    })
    .catch(() => {
        res.status(500).json({
            message: 'something went wrong'
        })
    });
});

module.exports = router;