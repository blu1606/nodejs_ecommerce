const Redis = require('redis')

class RedisPubSubService {
    constructor() {
        this.subClient = Redis.createClient();
        this.pubClient = Redis.createClient();
        // need to apply singleton pattern to prevent spam connection pool
    }

    async publish(channel, message) {
        if (!this.pubClient.isOpen)
            await this.pubClient.connect();

        return await this.pubClient.publish(channel, message)
    }

    async subscriber(channel, callback) {
        if (!this.subClient.isOpen)
            await this.subClient.connect();

        await this.subClient.subscribe(channel, (message) => {
            callback(message)
        })
    }
}

module.exports = new RedisPubSubService()