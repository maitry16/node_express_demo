const { Controller } = require('./Controller');
const { UserService } = require('../services/UserService');
const { Role } = require('../models/Role');
const { User } = require('../models/User');
const { User_Image } = require('../models/User_Image');
const { User_Role } = require('../models/User_Role');
const utils = require('../helpers/Utility'),
    config = require('../../config/config').getConfig()
const multer = require('multer');
const fs = require('fs');
const { HttpError } = require('../helpers/HttpError');
const { error } = require('console');
const { body } = require('express-validator/check');

const autoBind = require('auto-bind'),
    userService = new UserService(
        new User().getInstance(),
        new Role().getInstance(),
        new User_Image().getInstance(),
        new User_Role().getInstance()
    );

class UserController extends Controller {
    // file upload using multer
    storage = multer.diskStorage({
        'destination': function (req, file, cb) {
            const dir = config.UPLOAD_PATH;

            fs.exists(dir, (exist) => {
                if (!exist) {
                    return fs.mkdir(dir, (error) => cb(error, dir));
                }
                return cb(null, dir);
            });
        },
        'filename': function (req, file, cb) {
            const fileOriginalName = utils.slugify(file.originalname);

            cb(null, `${(new Date()).getTime()}-${fileOriginalName}`);
        }
    });
    upload = multer({
        'storage': this.storage,
        // 'limits': {
        //     'fileSize': 1024 * 1024 * 5
        // }
    });
    /**
     * This function used for delete multiple files.
     */
    async deleteFiles(files) {
        if (files) {
            files.forEach((filepath) => {
                fs.unlink(filepath.path ? filepath.path : filepath, (err) => {
                    if (err) {
                        /* HANLDE ERROR */
                    }
                });
            })

        }
    }
    constructor(service) {
        super(service);
        autoBind(this);
    }
    /**
        * This function used for add user validation
        */
    async addUserValidation(req, res, next) {
        req.checkBody('first_name', 'First Name Required').notEmpty()
        req.checkBody('last_name', 'Last Name Required').notEmpty()
        req.checkBody('email', 'Email is Required').notEmpty()
        req.checkBody('email', 'Please enter valid email address.').isEmail()
        req.checkBody('password', 'Password is Required').notEmpty()
        req.checkBody('phone', 'Phone Number is Required').notEmpty()
        req.checkBody('phone', 'Please enter valid phone number.').isMobilePhone()
        req.checkBody('code', 'Code is Required').notEmpty()
        req.checkBody('code', 'Please enter 6 character code').isLength({
            min: 6,
            max: 6
        })
        req.checkBody('role_ids', 'Role id is Required').notEmpty()

        var error = req.validationErrors()
        if (error && error.length) {
            if (req.files) {
                this.deleteFiles(req.files)

            }

            const err = new Error(error[0].msg);
            err.statusCode = 422;
            res.status(422).json(new HttpError(err));

        }
        else {
            let response = await this.service.isExistUser({ email: req.body.email })
            if (response && response.data && response.data.length > 0) {
                let err
                if (response.data[0].email == req.body.email) {
                    err = new Error("Email already exist.");
                    err.statusCode = 422;
                }
                if (response.data[0].phone == req.body.phone) {
                    err = new Error("Phone already exist.");
                    err.statusCode = 422;
                }
                if (req.files) {
                    this.deleteFiles(req.files)

                }
                res.status(422).json(new HttpError(err));

            }
            else {
                next(null, null)
            }
        }

    }
    /**
        * This function used for update user validation
        */
    async updateUserValidation(req, res, next) {
        if (req.body.phone) {
            req.checkBody('phone', 'Please enter valid phone number.').isMobilePhone()
        }
        if (req.body.code) {
            req.checkBody('code', 'Please enter 6 character code').isLength({
                min: 6,
                max: 6
            })
        }

        var error = req.validationErrors()
        if (error && error.length) {
            if (req.files) {
                this.deleteFiles(req.files)

            }

            const err = new Error(error[0].msg);
            err.statusCode = 422;
            res.status(422).json(new HttpError(err));

        }
        else {
            let errorFlag
            if (req.body.email || req.body.password) {
                let err
                err = new Error("You are not allow to edit sensitive information.");
                err.statusCode = 422;

                if (req.files) {
                    this.deleteFiles(req.files)
                }
                errorFlag = true
                return res.status(422).json(new HttpError(err));
            }
            if (req.body.phone) {
                let response = await this.service.isExistUser({ phone: req.body.phone })
                if (response && response.data && response.data.length > 0) {
                    let err
                    err = new Error("Phone already exist.");
                    err.statusCode = 422;

                    if (req.files) {
                        this.deleteFiles(req.files)
                    }
                    errorFlag = true
                    return res.status(422).json(new HttpError(err));
                }
            }
            if (!errorFlag) {
                let response = await this.service.isExist({ user_id: req.params.id })
                if (response.data && response.data.length > 0) {
                    let imagesPathArr = response.data.map((userImgData) => {
                        return `${config.UPLOAD_PATH}/${userImgData.image}`
                    })
                    this.deleteFiles(imagesPathArr)
                }
            }
            next(null, null)
        }


    }

    async insert(req, res, next) {
        const uploadPath = config.UPLOAD_PATH;
        let data = {
            user_details: req.body,
            user_images: req.files ? req.files : ''
        }
        const response = await this.service.insert(data);
        delete response.data
        return res.status(response.statusCode).json(response);
    } catch(e) {
        next(e);
    }
}


module.exports = new UserController(userService);
