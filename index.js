require( 'dotenv' ).config();
// Initialize DB Connection
require( './config/database' );

const config = require( './config/config' ).getConfig(),
    PORT = config.PORT;

console.log( `Mode: ${config.MODE}` );
console.log( `Port: ${PORT}` );

const { server } = require( './config/app' );

server.listen( PORT ).on( 'error', ( err ) => {
    console.log( 'Application failed to start' );
    console.error( 'error', err.message );
    process.exit( 0 );
} ).on( 'listening', () => {
    console.log( 'Application Started' );
} );


module.exports = { server };
