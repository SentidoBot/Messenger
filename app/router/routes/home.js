'use strict';


module.exports = (router, control) => {

    router.get('/', control.home);
    return router;
};
