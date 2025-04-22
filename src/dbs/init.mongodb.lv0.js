'use strict'

const mongoose = require('mongoose')
const connectString = 'mongodb://localhost:27017/shopDEV'
const { countConnect } = require("../helpers/check.connect")

mongoose.connect( connectString).then( _ => {
        console.log(`Connected Mongodb Success `, countConnect())

    })
    .catch( err => console.log(`Error Connect!`))

// dev

if (1 === 0) {
    mongoose.set('debug', true)
    mongoose.set('debug', {color: true})
}

module.exports = mongoose