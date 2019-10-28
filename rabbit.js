// import amqp from 'amqplib';
const amqp = require('amqplib');

const connStr = 'amqp://kchrqvmu:1dTH_RsBAzzyUmrQ8THE05FacFemFSiW@dove.rmq.cloudamqp.com/kchrqvmu',
    exchangeName = 'devday',
    queueName = 'messages';

const init = async (onReceived) =>{
    const
        conn = await amqp.connect(connStr),
        pubChan = await conn.createChannel(),
        subChan = await conn.createChannel();
        
    await subChan.assertExchange(exchangeName, 'fanout', {durable: false});
    await subChan.assertQueue(queueName);
    subChan.consume(queueName, function(msg) {
        if(msg.content && onReceived) {
            onReceived(msg.content);            
        }
    }, {
        noAck: true
    });

    await pubChan.bindQueue(queueName, exchangeName, '');
    
    process.on('exit', (code) => {
        if(pubChan){
            pubChan.close();
        }
        if(subChan){
            subChan.close();
        }
        console.log(`Closing rabbitmq channel`);
    });

    return {
        publish: (data) => {         
            try{
                const msg = Buffer.from(JSON.stringify(data));
                pubChan.sendToQueue(queueName, msg);
            }catch(e){
                console.error(`an error has occurred while publishing message: ${JSON.stringify(e)}`);
            }            
        }
    };
};

module.exports = init;