'use strict';


module.exports = (router, control) => {

    router.route('/messenger')
        .get(control.validate)
        .post(control.message);

    router.get('/messenger/:user/questions', control.questions);

    return router;
};
