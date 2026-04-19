'use strict'

const NOTI = require("../models/notification.model")

class NotificationService {

    static async pushNotiToSystem({
        type = 'SHOP-001',
        receivedId = 1,
        senderId = 1,
        options = {}
    }) {
        let noti_content

        if (type === 'SHOP-001') noti_content = `@@@ added new product: @@@@`
        else if (type === 'PROMOTION-001') noti_content = `@@@ added new voucher: @@@@`

        const newNoti = await NOTI.create({
            noti_type: type,
            noti_content: noti_content,
            noti_senderId: senderId,
            noti_receivedId: receivedId,
            noti_options: options
        })

        return newNoti
    }

    static async listNotiByUser({
        userId = 1,
        type = 'All',
        isRead = 0
    }) {
        const match = { noti_receivedId: userId }
        if (type != 'All') match['noti_type'] = type

        return await NOTI.aggregate([
            {
                $match: match
            },
            {
                $project: {
                    noti_type: 1,
                    noti_senderId: 1,
                    noti_receivedId: 1,
                    noti_content: 1,
                    createAt: 1,
                    noti_options: 1
                }
            }
        ])
    }
}

module.exports = NotificationService