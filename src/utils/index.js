'use strict'

const _ = require('lodash')
const mongoose = require('mongoose')
const { Types } = mongoose

const convertToObjectIdMongodb = id => new Types.ObjectId(id)
const withTransaction = async (fn) => {
    const session = await mongoose.startSession();
    try {
        return await session.withTransaction(async () => {
            return await fn(session);
        });
    } finally {
        session.endSession();
    }
};
const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields)
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]))
}

const removeUndefinedObject = obj => {
    Object.keys(obj).forEach(k => {
        if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) removeUndefinedObject(obj[k]);
        else if (obj[k] == null) {
            delete obj[k]
        }
    })

    return obj
}

const updateNestedObjectParser = obj => {
    const final = {}
    Object.keys(obj).forEach(k => {
        // Check if the value is an object, not null, and not an array
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            const response = updateNestedObjectParser(obj[k])
            Object.keys(response).forEach(a => {
                // Use dot notation for nested fields
                final[`${k}.${a}`] = response[a] // Corrected: use response[a]
            })
        } else {
            final[k] = obj[k]
        }
    })
    return final
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb,
    withTransaction
}