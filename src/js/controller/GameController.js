var EventEmitter = require('eventemitter3');

module.exports = class GameController extends EventEmitter{
    constructor(query){
        super();
        this.$game = $(query);
    }

    init(){
        this.$game.on('click', (e) => {this.putStone(e);});
    }

    putStone(e){
        this.emit('update_stone', 1, 1);
    }
}
