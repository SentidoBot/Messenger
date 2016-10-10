'use strict';


const errors = require('./errors.json');

module.exports = (error, req, res, next) => {

    const status = error.status || 404;
    const code = error.code || 10;

    res.sendStatus(status).send({
        status: status,
        code: code,
        message: errors[status][code] || error.message
    });

    next = null;
};
