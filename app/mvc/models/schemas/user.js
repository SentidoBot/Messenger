'use strict';


const co = require('co');

module.exports = mongoose => {

    const Schema = mongoose.Schema;
    const schema = new Schema(
        {
            username: {
                type: String,
                trim: true,
                lowercase: true,
                default: null
            },
            name: {
                first: {
                    type: String,
                    trim: true,
                    default: null
                },
                last: {
                    type: String,
                    trim: true,
                    default: null
                }
            },
            gender: {
                type: String,
                default: null
            },
            accounts: {
                messenger: {
                    type: String,
                    default: null
                },
                slack: {
                    type: String,
                    default: null
                },
                kik: {
                    type: String,
                    default: null
                },
                telegram: {
                    type: String,
                    default: null
                }
            },
            meta: {
                memberSince: {
                    type: Date,
                    default: Date.now
                }
            }
        },
        {
            strict: true,
            versionKey: false
        }
    );

    schema.statics = {

        find: function (userId, model = this) {

            return co(function* () {
                return yield model.findOne({ 'accounts.facebook': userId })
                    .lean()
                    .exec();
            }).then(user => Promise.resolve(user), error => Promise.reject(error));
        },

        count: function (model = this) {

            return co(function* () {
                const aggregation = (yield model.aggregate(
                    {
                        $group: {
                            _id: 0,
                            records: { $sum: 1 }
                        }
                    }
                ).exec())[0] || null;

                return aggregation ? aggregation.records : 0;
            }).then(records => Promise.resolve(records), error => Promise.reject(error));
        }
    };

    return mongoose.model('User', schema, 'users');
};
