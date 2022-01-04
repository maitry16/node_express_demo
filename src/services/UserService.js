'use strict';
const { Service } = require('./Service');
const autoBind = require('auto-bind');
const mongoose = require('mongoose'),
    config = require('../../config/config').getConfig()

class UserService {
    constructor(userModel, roleModel, userImageModel, userRoleModel) {
        this.userModel = userModel;
        this.roleModel = roleModel;
        this.userImageModel = userImageModel
        this.userRoleModel = userRoleModel
        autoBind(this);
    }

    /**
     * This function used to add user based on role with images into system.
     */
    async insert(data) {
        const uploadPath = config.UPLOAD_PATH;
        try {
            let response = await new Service(this.userModel).insert(data.user_details)
            if (response && response.data && response.data._id) {
                let userRoleDetails = {
                    user_id: response.data._id,
                    role_ids: data.user_details.role_ids
                }
                await new Service(this.userRoleModel).insert(userRoleDetails)

                if (data.user_images) {
                    let userImagesArr = []
                    data.user_images.forEach((filepath) => {
                        userImagesArr.push({ image: filepath.path.split(`${uploadPath}/`)[1], user_id: response.data._id })
                    })
                    await new Service(this.userImageModel).insertMany(userImagesArr)

                }

            }
            return response
        } catch (errors) {
            throw errors;
        }
    }
    /**
 * This function used to update user based on role with images into system.
 */

    async update(id, data) {
        const uploadPath = config.UPLOAD_PATH;
        let { files } = data
        let { role_ids } = data.data
        try {
            let response = await new Service(this.userModel).findByIdAndUpdate(id, data.data)
            if (response && response.data && response.data._id) {
                if (role_ids) {
                    let userRoleDetails = {
                        role_ids: role_ids
                    }
                    await new Service(this.userRoleModel).update({ user_id: response.data._id }, userRoleDetails)
                }
                if (files) {
                    let userImagesArr = []
                    files.forEach((filepath) => {
                        userImagesArr.push({ image: filepath.path.split(`${uploadPath}/`)[1], user_id: response.data._id })
                    })
                    await new Service(this.userImageModel).deleteMany({ user_id: response.data._id })
                    await new Service(this.userImageModel).insertMany(userImagesArr)

                }
            }
            return response
        } catch (errors) {
            throw errors;
        }
    }
    /**
     * This function used for checking this type of record exist or not.     */

    async isExistUser(data) {
        try {
            let response = await new Service(this.userModel).isExist(data)
            return response
        } catch (errors) {
            throw errors;
        }
    }

    async isExist(data) {
        try {
            let response = await new Service(this.userImageModel).isExist(data)
            return response
        } catch (errors) {
            throw errors;
        }
    }
    /**
     * This function used to delete user(i.e soft delete)
     */
    async delete(id) {

        try {
            const response = await new Service(this.userModel).update({ _id: id }, { deletedAt: new Date() });
            return response
        } catch (errors) {
            throw errors;
        }
    }

     /**
     * This function used to get all user except deleted user.
     */
    async getAll(query) {

        try {
            query.condition = { deletedAt: { $exists: false } }
            let aggregateQuery = []
            var limit = query.limit == undefined ? 10 : Number(query.limit);
            var skip = query.skip == undefined ? 0 : Number(query.skip);

            aggregateQuery.push({
                $match: { deletedAt: { $exists: false } }
            })
            aggregateQuery.push({
                $limit: limit
            });

            aggregateQuery.push({
                $skip: skip
            });
            aggregateQuery.push({
                $lookup: {
                    "from": "user_roles",
                    "localField": "_id",
                    "foreignField": "user_id",
                    "as": "userRoleDetails"
                }
            });
            aggregateQuery.push({
                $unwind: {
                    path: "$userRoleDetails",
                    preserveNullAndEmptyArrays: true
                }
            });

            aggregateQuery.push({
                $unwind: {
                    path: "$userRoleDetails.role_ids",
                    preserveNullAndEmptyArrays: true
                }
            });
            aggregateQuery.push({
                $lookup: {
                    "from": "roles",
                    "localField": "userRoleDetails.role_ids",
                    "foreignField": "_id",
                    "as": "roleDetails"
                }
            });
            aggregateQuery.push({
                $unwind: {
                    path: "$roleDetails",
                    preserveNullAndEmptyArrays: true
                }
            });

            aggregateQuery.push({
                $lookup: {
                    "from": "user_images",
                    "localField": "_id",
                    "foreignField": "user_id",
                    "as": "userImagesDetails"
                }
            });
            aggregateQuery.push({
                $unwind: {
                    path: "$userImagesDetails",
                    preserveNullAndEmptyArrays: true
                }
            });


            aggregateQuery.push({
                $group: {
                    _id: "$_id",
                    first_name: { $first: "$first_name" },
                    last_name: { $first: "$last_name" },
                    email: { $first: "$email" },
                    phone: { $first: "$phone" },
                    code: { $first: "$code" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    updatedAt: { $first: "$updatedAt" },


                    roles: { $addToSet: { _id: "$roleDetails._id", name: "$roleDetails.name" } },
                    user_images: { $addToSet: { $concat: [config.UPLOAD_PATH, "/", "$userImagesDetails.image"] } },

                }
            });
            const response = await new Service(this.userModel).aggregate({ deletedAt: { $exists: false } }, aggregateQuery);
            return response
        } catch (errors) {
            throw errors;
        }
    }
}

module.exports = { UserService };
