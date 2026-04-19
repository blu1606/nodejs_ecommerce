const { Kafka, logLevel } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
    logLevel: logLevel.NOTHING
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const runConsumer = async () => {
    await consumer.connect()
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            })
        },
    })
}

runConsumer().catch(console.error)


const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
errorTypes.forEach(type => {
    process.on(type, async e => {
        try {
            console.log(`Tiến trình chết do ${type}`);
            await consumer.disconnect();
            process.exit(0);
        } catch (_) {
            process.exit(1);
        }
    })
})
signalTraps.forEach(type => {
    process.once(type, async () => {
        try {
            console.log(`\nBắt được tín hiệu tắt app ${type}. Đang ngắt kết nối Kafka...`);
            await consumer.disconnect();
            console.log('Ngắt kết nối thành công. Goodbye!');
        } finally {
            process.kill(process.pid, type);
        }
    })
})
