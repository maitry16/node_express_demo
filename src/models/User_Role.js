const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );

class User_Role {

    initSchema() {
        const schema = new Schema( {
            'user_id':{
                type: mongoose.Schema.Types.ObjectId,
                required:true,
                ref: 'users'
              },
              'role_ids':{
                type: [mongoose.Schema.Types.ObjectId],
                // required:true,
                ref: 'roles'
              },
        }, { 'timestamps': true } );

        
        try {
            mongoose.model( 'user_roles', schema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'user_roles' );
    }
}

module.exports = { User_Role };
