'use strict';
const RoleController = require('../controllers/RoleController');
const UserController = require( '../controllers/UserController' );
const express = require( 'express' ),
    router = express.Router();

router.post( '/addUser', [UserController.upload.array( 'file' ),UserController.addUserValidation ],UserController.insert );
router.post( '/addRole', [RoleController.addRoleValidation ],RoleController.insert );
router.delete( '/deleteUser/:id' ,UserController.delete);
router.get( '/getAllUser', UserController.getAll );
router.put( '/updateUser/:id',[UserController.upload.array( 'file' )],UserController.updateUserValidation, UserController.update);

module.exports = router;
