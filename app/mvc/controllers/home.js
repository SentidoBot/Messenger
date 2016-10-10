'use strict';


module.exports = {

    home: (req, res) => {
        res.send({
            message: 'You are lost. Try using an actual endpoint, use some common sense. ;)'
        });
    }
};
