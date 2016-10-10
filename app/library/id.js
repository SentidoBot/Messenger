'use strict';


const Hashids = require('hashids');
const config = _require('config');
const hashids = new Hashids(config.api.key, config.api.hashLength);

module.exports = {

    encode: string => {
        return hashids.encodeHex(string);
    },

    decode: hash => {
        return hashids.decodeHex(hash) || null;
    }
};
