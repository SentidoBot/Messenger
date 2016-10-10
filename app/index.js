'use strict';


global._require = module => require(`${__dirname}/${module}`);
const express = require('express');
const app = express();
const port = process.env.PORT || 9000;

app.set('views', `${__dirname}/mvc/views`);
app.set('view engine', 'pug');
app.use(express.static(`${__dirname}/public`));
app.locals.pretty = true;
app.use(
    (req, res, next) => {
        res.setHeader('X-Powered-By', 'analogbird.com');
        return next();
    },
    require('compression')(),
    require('body-parser').json(),
    require('body-parser').urlencoded({ extended: true }),
    require('serve-favicon')(`${__dirname}/public/img/favicon.png`),
    require('./router')(express),
    require('./library/error')
);

app.listen(port, () => {
    console.log(`Up on port: ${port}`);
});
