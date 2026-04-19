const amqp = require('amqplib')
const message = 'hello, rabitmq'

const runConsumer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        const queueName = 'test-channel'
        await channel.assertQueue(queueName, {
            durable: true,
        })

        // send messages to consumer channel 
        channel.consume(queueName, (message) => {
            console.log(`Received ${message.content.toString()}`)
        }, {
            noAck: false
        })
        console.log(`message sent: `, message)

    } catch (error) {
        console.error(error)
    }
}

runConsumer().catch(console.error)