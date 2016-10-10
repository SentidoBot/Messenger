'use strict';


const co = require('co');
const m = _require('mvc/models');
const id = _require('library/id');

module.exports = mongoose => {

    const Schema = mongoose.Schema;
    const schema = new Schema(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                trim: true,
                required: true
            },
            tally: {
                yes: {
                    type: Number,
                    default: 0
                },
                no: {
                    type: Number,
                    default: 0
                },
                pass: {
                    type: Number,
                    default: 0
                }
            },
            meta: {
                askedOn: {
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

        getAll: function (userId, model = this) {

            return co(function* () {
                const user = yield m.user.find(userId);
                if (!user) {
                    return [];
                }

                const questions = yield model.find({ user: user._id })
                    .sort({ 'meta.askedOn': 'desc' })
                    .lean()
                    .exec();

                return questions.map(question => {
                    question.id = id.encode(question._id);
                    question._id = undefined;

                    return question;
                });
            }).then(questions => Promise.resolve(questions), error => Promise.reject(error));
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

    return mongoose.model('Question', schema, 'questions');
};
