'use strict';


module.exports = {
    env: process.env.NODE_ENV,
    api: {
        key: process.env.API_KEY,
        hashLength: parseInt(process.env.API_HASH_ID_LENGTH) || 6
    },
    bots: {
        messenger: {
            verifyToken: process.env.FB_VERIFY_TOKEN,
            accessToken: process.env.FB_ACCESS_TOKEN,
            pageId: process.env.FB_PAGE_ID,
            appId: process.env.FB_APP_ID,
        }
    },
    mongo: {
        url: process.env.MONGO_URL,
        options: {
            db: {
                native_parser: true
            },
            server: {
                poolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
                socketOptions: {
                    keepAlive: parseInt(process.env.MONGO_KEEP_ALIVE) || 1
                }
            }
        }
    }
};
