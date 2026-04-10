'use strict'

const shopModel = require("../shop.model")

const findByEmail = async ({ email, select = {
    email: 1, password: 1, name: 1, status: 1, roles: 1
} }) => {
    return await shopModel.findOne({ email }).select(select).lean()
}

const createShop = async ({ name, email, password, roles }) => {
    return await shopModel.create({ name, email, password, roles })
}


module.exports = {
    findByEmail,
    createShop
}