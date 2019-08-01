const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const joi = require('@hapi/joi');
const User = require('../models/user');

exports.addUser = (req, res, next) => {
    const schema = joi.object().keys({
        username: joi.string().min(6).max(50).email({ minDomainSegments: 2 }).required(),
        password: joi.string().regex(/^[a-zA-Z0-9]{6,16}$/).required()
    }).with('username', 'password');
    const bodyVal = joi.validate({ username: req.body.username, password: req.body.password }, schema);
    if (bodyVal.error !== null) {
        next(createError('Bad Request', 400));
    }
    User.findOne({ username: req.body.username })
    .then((foundUser) => {
        if (foundUser) {
            next(createError('User With Given Username Already Exists', 409));
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    next(createError('Something Went Wrong', 500));
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
                        next(createError('Bad Request', 400));
                    });
                }
            }); 
        }
    })
    .catch(() => {
        next(createError('Bad Request', 400));
    });
};

exports.login = (req, res, next) => {
    User.findOne({ username: req.body.username })
    .then(foundUser => {
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
                    next(createError('Auth Failed', 401));
                } 
            });
        } else {
            next(createError('Auth Failed', 401));
        }
    })
    .catch(() => {
        next(createError('Bad Request', 400));
    });
}

function createError(message, status) {
    const err = new Error(`${message}`);
    err.status = status;
    return err;
}