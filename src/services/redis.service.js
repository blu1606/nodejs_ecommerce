'use strict'

const redis = require('redis')
const redisClient = redis.createClient()

const _RETRYTIMES = 10;
const _EXPIRETIME = 3000; // 3 seconds

/**
 * Acquire a distributed lock
 * @param {string} productId 
 * @returns {Promise<string|null>}
 */
const acquireLock = async (productId) => {
    const key = `lock_v1_${productId}`

    for (let i = 0; i < _RETRYTIMES; i++) {
        // create key for payment access permission 
        const result = await redisClient.set(key, 'locked', {
            NX: true,
            PX: _EXPIRETIME
        })
        console.log(`result:::`, result)

        if (result === 'OK') return key;
        // re-try if not find key
        await new Promise((resolve) => setTimeout(resolve, 50))
    }
    return null;
}

const releaseLock = async keyLock => {
    return await redisClient.del(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}