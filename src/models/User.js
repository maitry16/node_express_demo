const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );
const uniqueValidator = require( 'mongoose-unique-validator' );
const bcrypt = require( 'bcrypt' ),
    SALT_WORK_FACTOR = 10;
    const jwt = require( 'jsonwebtoken' ),
    config = require( '../../config/config' ).getConfig(),
    jwtKey = config.JWT_SECRET,
    jwtExpirySeconds = 172800;

class User {

    initSchema() {
        const schema = new Schema( {
            'first_name': {
                'type': String,
                'required': true,
            },
            'last_name': {
                'type': String,
                'required': true,
            },
            'email': {
                'type': String,
                'unique': true,
                'required': true,
            },
            'password': {
                'type': String,
                'required': true,
                'select': false
            },
            'phone': {
                'type': String,
                'required': true,
                'unique': true
            },
            'code': {
                'type': String,
                'required': true
            },
            'token': {
                'type': String,
                'required': false,
            },
            'deletedAt': {
                'type': Date
            },

        }, { 'timestamps': true } );


        // Pre save Hook
        schema.pre( 'save', function( next ) {
            const user = this;
            // only hash the password if it has been modified (or is new)

            if ( this.isModified( 'password' ) || this.isNew ) {
                bcrypt.genSalt( SALT_WORK_FACTOR, ( err, salt ) => {
                    if ( err ) {
                        return next( err );
                    }
                    bcrypt.hash( user.password, salt, ( hashErr, hash ) => {
                        if ( hashErr ) {
                            return next( hashErr );
                        }
                        // override the cleartext password with the hashed one
                        user.password = hash;
                        next();
                    } );
                } );
            } else {
                return next();
            }
        } );

        schema.statics.generateToken = async function( user ) {
            // Create a new token with the user details
            try {
                const token = await jwt.sign( {
                    // '_id': user._id.toString(),
                    'email': user.email,
                    'code': user.code,
                }, jwtKey, {
                    'algorithm': 'HS256',
                    'expiresIn': jwtExpirySeconds,
                } );

                return token;
            } catch ( e ) {
                throw e;
            }
        };

        schema.statics.decodeToken = async function( token ) {
            // Create a new token with the user details
            try {
                return await jwt.verify( token, jwtKey );
            } catch ( e ) {
                throw e;
            }
        };
        schema.statics.findByEmail = function( email ) {
            return this.findOne( { 'email': email } );
        };
        schema.plugin( uniqueValidator );
        try {
            mongoose.model( 'users', schema );
        } catch ( e ) {
        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'users' );
    }
}

module.exports = { User };
