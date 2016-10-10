'use strict';


const co = require('co');
const req = require('request');
const m = _require('mvc/models');

class Messenger {

    constructor (accessToken) {
        this.accessToken = accessToken;
    }

    request (payload, options = {}) {

        const requestObject = {
            method: options.method || 'POST',
            url: `https://graph.facebook.com/v2.7/${options.userId || 'me/messages'}`,
            qs: {
                access_token: this.accessToken
            },
            json: payload || true
        };

        if (options.fields) {
            requestObject.fields = options.fields;
        }

        return new Promise((yes, no) => {
            req(requestObject, (error, res, body) => {
                if (error || body.error) {
                    return no(error || body.error);
                }

                yes(body);
            });
        });
    }

    typing (recipient) {

        return this.request({
            recipient: {
                id: recipient
            },
            sender_action: 'typing_on'
        });
    }

    cards (data) {

        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: data.map(card => {
                        return {
                            title: card.title,
                            subtitle: 'Subtitle',
                            image_url: card.image
                        };
                    })
                }
            }
        };
    }

    image (image) {

        return {
            attachment: {
                type: 'image',
                payload: {
                    url: `https://s3-us-west-2.amazonaws.com/media.senti.do/${image}.png`
                }
            }
        };
    }

    createProfile (userId, profile) {

        return m.user.create({
            name: {
                first: profile.first_name || null,
                last: profile.last_name || null
            },
            gender: profile.gender || null,
            accounts: {
                messenger: userId
            }
        });
    }

    getReply (data) {

        const top = this;
        return co(function* () {
            if (data.event.message) {
                return {
                    found: true,
                    text: ['Message']
                };
            }

            const reply = { image: null };
            if (data.event.postback) {
                switch (data.event.postback.payload) {
                    case 'start':
                        reply.image = top.image('clown');
                        reply.text = yield m.bot.find(data.event.postback.payload);
                        break;

                    case 'new_question':
                        reply.text = yield m.bot.find(data.event.postback.payload);
                        break;

                    case 'my_questions':
                        const questions = yield m.question.getAll(data.profile._id);
                        if (!questions) {
                            reply.text = yield m.bot.find('no_questions');
                            reply.image = top.image('sad');
                        }
                        break;
                }
            }

            return reply;
        }).then(reply => Promise.resolve(reply), error => Promise.reject(error));
    }
}

module.exports = Messenger;
