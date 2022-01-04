const { Controller } = require( './Controller' );
const { Role } = require( '../models/Role' );
const utils = require( '../helpers/Utility' ),
config = require( '../../config/config' ).getConfig()
const multer = require( 'multer' );
const fs = require( 'fs' );
const { HttpError } = require('../helpers/HttpError');
const { error } = require('console');
const { body } = require('express-validator/check');
const { RoleService } = require('../services/RoleService');

const autoBind = require( 'auto-bind' ),
    roleService = new RoleService(
        new Role().getInstance()
    );

class RoleController extends Controller {
        
    constructor( service ) {
        super( service );
        autoBind( this );
    }
    /**
     * This function used for role validation
     */
    async addRoleValidation( req, res, next ) {
        req.checkBody('name', 'Role Name Required').notEmpty()
      
        var error = req.validationErrors()
        if (error && error.length) {
            const err = new Error( error[0].msg );
            err.statusCode = 422;
            res.status(422).json(new HttpError(err));

        }
        else
        {
            let response = await this.service.isExist({name:req.body.name})
            if(response && response.data && response.data.length > 0)
            {
                let err
                if(response.data[0].name == req.body.name)
                {
                    err =new Error( "Role already exist." );
                    err.statusCode = 422;                    
                }
                res.status(422).json(new HttpError(err));
            }
            else
            {
            next(null,null)
            }
        }

}
}


module.exports = new RoleController( roleService );
