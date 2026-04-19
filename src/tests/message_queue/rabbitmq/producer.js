const amqp = require('amqplib')
const message = 'hello, rabitmq'

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        const queueName = 'test-channel'
        await channel.assertQueue(queueName, {
            durable: true,
        })

        // send messages to consumer channel 
        channel.sendToQueue(queueName, Buffer.from(message))
        console.log(`message sent: `, message)

    } catch (error) {
        console.error(error)
    }
}

runProducer().catch(console.error)