const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );
const uniqueValidator = require( 'mongoose-unique-validator' );

class Role {

    initSchema() {
        const schema = new Schema( {
            'name': {
                'type': String,
                'required': true,
                'unique':true
            }            
        }, { 'timestamps': true } );

        schema.plugin( uniqueValidator );
        try {
            mongoose.model( 'roles', schema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'roles' );
    }
}

module.exports = { Role };
