const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'superpuperduperkey');
        req.params.userId = decoded.userId;
        next();
    } catch(err) {
        const error = new Error('Auth Failed');
        error.status = 401;
        next(error)
    }
};