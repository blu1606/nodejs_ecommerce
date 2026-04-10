require('dotenv').config() // to get access to file env
const app = require("./src/app");

const PORT = process.env.PORT || 3055

const server = app.listen(PORT, () => {
    console.log(`WSV eCommerce start with ${PORT}`)
})

process.on('SIGINT', () => {
    server.close(async () => {
        console.log(`Exit Server Express`)
        await instanceMongodb.disconnect()
        process.exit(0);
    })
})