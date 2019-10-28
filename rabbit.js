const amqp = require('amqplib');

const connStr = 'amqp://kchrqvmu:1dTH_RsBAzzyUmrQ8THE05FacFemFSiW@dove.rmq.cloudamqp.com/kchrqvmu',
    exchangeName = 'devday';

const init = async () =>{
    const conn = await amqp.connect(connStr),
        pubChan = await conn.createChannel(),
        subChan = await conn.createChannel(),
        subscriptions = {};

    await subChan.assertExchange(exchangeName, 'fanout', {durable: false});
    
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
                pubChan.publish(exchangeName, '', msg);
            }catch(e){
                console.error(`an error has occurred while publishing message: ${JSON.stringify(e)}`);
            }            
        },
        subscribe : async (id, onReceived) =>{            
            const queue = await subChan.assertQueue('', {exclusive: true});

            await subChan.bindQueue(queue.queue, exchangeName, '');

            subChan.consume(queue.queue, function(msg) {
                if(msg && msg.content && onReceived) {
                    onReceived(msg.content);            
                }
            }, {
                noAck: true
            });

            subscriptions[id] = queue;
        },
        unsubscribe: async (id) =>{
            const queue = subscriptions[id];
            if(queue){
                await subChan.unbindQueue(queue.queue, exchangeName, '');
                await subChan.deleteQueue(queue.queue);
            }          
        }
    };
};

module.exports = init;