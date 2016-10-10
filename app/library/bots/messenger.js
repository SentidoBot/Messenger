'use strict';


const co = require('co');
const url = require('url');
const nap = require('pancho');
const async = require('async');
const qs = require('querystring');
const Helper = require('./helpers/messenger');
const m = _require('mvc/models');

class Messenger extends require('events').EventEmitter {

    constructor (config = {}) {
        super();

        if (!config.accessToken || !config.verifyToken) {
            throw new Error('Missing access and validation token, for Facebook.');
        }

        this.verifyToken = config.verifyToken;
        this.helper = new Helper(config.accessToken);
    }

    getProfile (userId) {

        const top = this;
        return co(function* () {
            let profile = yield m.user.find(userId);
            if (profile) {
                return profile;
            }

            profile = yield top.helper.request(null, {
                method: 'GET',
                userId: userId,
                fields: 'first_name,last_name,gender,profile_pic'
            });

            yield top.helper.createProfile(userId, profile);
            return profile;
        }).then(profile => Promise.resolve(profile), error => Promise.reject(error));
    }

    reply (recipient, data) {

        const single = (payload, callback = () => {}) => {
            payload.recipient = { id: recipient };
            return this.helper.typing(recipient)
                .then(() => nap('0.33 seconds'))
                .then(() => this.helper.request(payload))
                .then(() => callback());
        };
        const all = reply => {
            async.eachOfSeries(reply.text, (line, index, callback) => {
                const payload = { message: { text: line } };
                if (reply.options && index === reply.text.length - 1) {
                    payload.message.quick_replies = reply.options;
                }

                single(payload, callback);
            }, error => {
                if (error) {
                    console.error('Message sending error:', error);
                }
            });
        };

        const top = this;
        co(function* () {
            const reply = yield top.helper.getReply(data);
            if (reply.image) {
                yield single({ message: reply.image });
            }

            all(reply);
        }).catch(error => console.error(error));
    }

    validate (req, res, next) {

        const query = qs.parse(url.parse(req.url).query);
        if (query['hub.verify_token'] === this.verifyToken) {
            return res.send(query['hub.challenge']);
        }

        next({ status: 403, code: 10 });
    }

    channel (messages, type = 'message') {

        messages.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                type = event.postback ? 'postback'
                    : event.delivery ? 'delivery'
                    : event.optin ? 'authentication'
                    : type;

                this._emit(type, event);
            });
        });
    }

    _emit (type, event) {
        this.emit(type, event, this.reply.bind(this, event.sender.id));
    }
}

module.exports = config => {

    const messenger = new Messenger(config);
    const next = (event, reply) => {
        messenger.getProfile(event.sender.id)
            .then(profile => reply({
                profile: profile,
                event: event
            }))
            .catch(error => messenger.emit('error', error));
    };

    messenger.on('error', error => console.error(error));
    messenger.on('message', (event, reply) => next(event, reply));
    messenger.on('postback', (event, reply) => next(event, reply));
    messenger.on('authentication', (event, reply) => next(event, reply));

    return messenger;
};
