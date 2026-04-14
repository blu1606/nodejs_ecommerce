const redisPubsubService = require("../services/redisPubsub.service");

class InventoryServiceTest {

    constructor() {
        redisPubsubService.subscriber('purchase_events', (message) => {
            const data = JSON.parse(message);
            InventoryServiceTest.updateInventory(data.productId, data.quantity)
        })
    }

    static updateInventory(productId, quantity) {
        console.log(`Update inventory ${productId} with quantity ${quantity}`)
    }
}

module.exports = new InventoryServiceTest()