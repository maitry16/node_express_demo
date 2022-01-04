const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );

class User_Image {

    initSchema() {
        const schema = new Schema( {
            'user_id':{
                type: mongoose.Schema.Types.ObjectId,
                required:true,
                ref: 'users'
              },
            '': {
                'type': String,
                'required': false,
            },
        }, { 'timestamps': true } );

        try {
            mongoose.model( 'user_images', schema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'user_images' );
    }
}

module.exports = { User_Image };
