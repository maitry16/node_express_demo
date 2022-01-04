'use strict';
const mongoose = require('mongoose');
const autoBind = require('auto-bind');
const { HttpResponse } = require('../helpers/HttpResponse');

class Service {
    /**
     * Base Service Layer (i.e contain common db function (purpose:- reusability))
     * @param model
     */
    constructor(model) {
        this.model = model;
        autoBind(this);
    }
    /**
     * Get all records by using find query.
     */
    async getAll(query) {
        let { skip, limit, sortBy } = query;

        skip = skip ? Number(skip) : 0;
        limit = limit ? Number(limit) : 10;
        sortBy = sortBy ? sortBy : { 'createdAt': -1 };


        delete query.skip;
        delete query.limit;
        delete query.sortBy;

        if (query._id) {
            try {
                query._id = new mongoose.mongo.ObjectId(query._id);
            } catch (error) {
                throw new Error('Not able to generate mongoose id with content');
            }
        }
        if (query.condition) {
            query = query.condition
        }
        try {
            const items = await this.model
                .find(query)
                .sort(sortBy)
                .skip(skip)
                .limit(limit),

                total = await this.model.countDocuments(query);

            return new HttpResponse(items, { 'totalCount': total });
        } catch (errors) {
            throw errors;
        }
    }
    /**
     * Get all records by using aggregate query.
     */

    async aggregate(countQuery, query) {
        try {
            const items = await this.model
                .aggregate(query)

            let total = await this.model.countDocuments(countQuery);

            return new HttpResponse(items, { 'totalCount': total });
        } catch (errors) {
            throw errors;
        }

    }

    /**
 * Get Single Details
 */

    async get(id) {
        try {
            const item = await this.model.findById(id);

            if (!item) {
                const error = new Error('Item not found');

                error.statusCode = 404;
                throw error;
            }

            return new HttpResponse(item);
        } catch (errors) {
            throw errors;
        }
    }
    /**
     * This function used for create record
     */
    async insert(data) {
        try {
            const item = await this.model.create(data);

            if (item) {
                return new HttpResponse(item);
            }
            throw new Error('Something wrong happened');

        } catch (error) {
            throw error;
        }
    }
    /**
   * This function used for create multiple records
   */
    async insertMany(data) {
        try {
            const item = await this.model.insertMany(data);

            if (item) {
                return new HttpResponse(item);
            }
            throw new Error('Something wrong happened');

        } catch (error) {
            throw error;
        }
    }
    /**
   * This function used for delete multiple record
   */
    async deleteMany(query) {
        try {
            let isDeleted = await this.model.deleteMany(query);

            if (isDeleted) {
                return new HttpResponse({});
            }
            throw new Error('Something wrong happened');

        } catch (error) {
            throw error;
        }
    }
    /**
       * This function used for update based on id
       */
    async findByIdAndUpdate(id, data) {
        try {
            const item = await this.model.findByIdAndUpdate(id, data, { 'new': true });

            return new HttpResponse(item);
        } catch (errors) {
            throw errors;
        }
    }
    /**
   * This function used for update based on query criteria
   */
    async update(query, data) {
        try {
            const item = await this.model.updateOne(query, { $set: data }, { 'new': true })
            return new HttpResponse({},{'message':"Edited Successfully."});
        } catch (errors) {
            throw errors;
        }
    }
    /**
       * This function used for delete record based on ID.
       */
    async delete(id) {
        try {
            const item = await this.model.findByIdAndDelete(id);

            if (!item) {
                const error = new Error('Item not found');

                error.statusCode = 404;
                throw error;
            } else {
                return new HttpResponse({}, { 'deleted': true },{'message':"Deleted Successfully."});
            }
        } catch (errors) {
            throw errors;
        }
    }
    /**
       * This function used for check record is exist
       */
    async isExist(query) {
        try {
            const item = await this.model.find(query);
            if (!item) {
                const error = new Error('Item not found');

                error.statusCode = 404;
                throw error;
            }

            return new HttpResponse(item);
        } catch (errors) {
            throw errors;
        }
    }
}

module.exports = { Service };
