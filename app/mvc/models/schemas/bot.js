'use strict';


const co = require('co');

module.exports = mongoose => {

    const Schema = mongoose.Schema;
    const schema = new Schema(
        {
            section: {
                type: String,
                trim: true,
                lowercase: true,
                required: true
            },
            text: [String]
        },
        {
            strict: true,
            versionKey: false
        }
    );

    schema.statics = {

        find: function (section, model = this) {

            return co(function* () {
                const message = yield model.findOne({ section: section })
                    .lean()
                    .exec();

                return message ? message.text : [];
            }).then(message => Promise.resolve(message), error => Promise.reject(error));
        }
    };

    return mongoose.model('Bot', schema, 'bot');
};
