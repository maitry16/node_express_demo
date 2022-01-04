'use strict';
const { HttpError } = require('../src/helpers/HttpError');
const AuthRoutes = require('../src/routes/auth');
const path = require( 'path' );
const fs = require( 'fs' );

const routesPath = path.resolve(`${__dirname}/../src/routes`),
      PATHS = fs.readdirSync(routesPath),
      moduleMapper = [];


module.exports.setRoutes = (app) => {

    /**
     * Application Root Route.
     * Set the Welcome message or send a static html or use a view engine.
     */
    app.get('/', (req, res) => {
        res.send('Welcome to the APP');
    });

    /**
     * API Route.
     * All the API will start with "/api/[MODULE_ROUTE]"
     */
    app.use('/auth', AuthRoutes);  

    PATHS.forEach((module) => {
        if (module !== 'auth.js') {
            const name = path.basename(module,".js")
            app.use(`/api/${name}`, require(path.resolve(routesPath, module)));
            moduleMapper.push({
                'Module': name,
                'Route': `/${name}`
            });
        }
    });


    /**
     * If No route matches. Send user a 404 page
     */
    app.use('/*', (req, res) => {
        const error = new Error('Requested path does not exist.');

        error.statusCode = 404;
        res.status(error.statusCode).json(new HttpError(error));
    });
};
