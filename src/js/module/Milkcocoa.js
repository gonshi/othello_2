var EventEmitter = require('eventemitter3');

module.exports = class Milkcocoa extends EventEmitter{
    constructor(app_id, datastore){
        super();
        this.app = new MilkCocoa(`${app_id}.mlkcca.com`);
        this.datastore = this.app.dataStore(datastore);
    }

    init(){
        this.datastore.on('send', (arg) => {
            this.emit('send', arg.value);
        });
    }

    send(object){
        this.datastore.send(object);
    }
}
