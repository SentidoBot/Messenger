'use strict';


const moment = require('moment');
const config = _require('config');
const m = _require('/mvc/models');
const messenger = _require('library/bots/messenger')(config.bots.messenger);

module.exports = {

    validate: messenger.validate,

    message: (req, res) => {
        messenger.channel(req.body);
        res.send({ status: 200 });
    },

    questions: (req, res) => {
        return req.params.user ? m.question.getAll(req.params.user)
            .then(questions => {
                questions.largest = 'yes';
                res.send(questions.map(question => {
                    for (let item in question.tally) {
                        if (question.tally[item] > question.tally[question.largest]) {
                            question.largest = item;
                        }
                    }

                    question.meta.askedOn = 'asked: ' + moment(question.meta.askedOn).fromNow();
                    return question;
                }));
            }) : res.render('questions');
    }
};
