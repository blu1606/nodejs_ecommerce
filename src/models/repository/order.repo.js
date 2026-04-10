const { convertToObjectIdMongodb } = require("../../utils")
const orderModel = require("../order.model")

const getOrdersByUser = async (userId) => {
    return await orderModel.find({
        order_userId: userId
    }).lean()
        .sort({ createdOn: -1 })
}

const getOneOrderByUser = async (userId, orderId) => {
    return await orderModel.findOne({
        order_userId: userId,
        _id: convertToObjectIdMongodb(orderId)
    }).lean()
}

const findOrderById = async (orderId) => {
    return await orderModel.findById(convertToObjectIdMongodb(orderId)).lean()
}

const updateStatus = async ({ orderId, orderStatus }) => {
    return await orderModel.updateOne(
        { _id: orderId },
        {
            $set: {
                order_status: orderStatus
            }
        }
    )
}

const extractProductsFromOrder = (orderProducts) => {
    return orderProducts.flatMap(order => order.item_products)
}


module.exports = {
    getOrdersByUser,
    getOneOrderByUser,
    updateStatus,
    extractProductsFromOrder,
    findOrderById
}