const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const joi = require('@hapi/joi');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    const schema = joi.object().keys({
        username: joi.string().min(6).max(50).email({ minDomainSegments: 2 }).required(),
        password: joi.string().regex(/^[a-zA-Z0-9]{6,16}$/).required()
    }).with('username', 'password');
    const bodyVal = joi.validate({ username: req.body.username, password: req.body.password }, schema);
    if (bodyVal.error !== null) {
        return res.status(400).json({
            message: 'Bad request'
        });
    }
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
    console.log(req.body);
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