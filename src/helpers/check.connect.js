'use strict'

const { default: mongoose } = require("mongoose")
const os = require('os')
const process = require('process')
const _SECONDS = 5000

// count connect
const countConenct = () => {
    const numConnection = mongoose.connections.length
    console.log(`Number of connections:: ${numConnection}`)
}

// check over load
const checkOverload = () => {
    setInterval( () => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss; 
        // assume maximum number of connections based on number of cores
        const maxConnecctions = numCores * 5; 
        
        console.log(`Active connections: ${numConnection}`)
        console.log(`Memory usage:: ${memoryUsage / 1024 / 1024} MB`)
        
        if (numConnection > maxConnecctions) {
            console.log(`Connection overload detected!`)
        }


    }, _SECONDS) // monitors every 5 seconds
}

module.exports = {
    countConenct,
    checkOverload
}