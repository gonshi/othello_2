var EventEmitter = require('eventemitter3');
var GameController = require('../controller/GameController');

var _block_stones = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
];

function updateStone(x, y){
}

module.exports = class GameModel extends EventEmitter{
    constructor(){
        super();
        this.gameController = new GameController('.game');
    }

    init(){
        this.gameController.on('update_stone', (x, y) => {
            updateStone(x, y);
            this.emit('change', _block_stones);
        });

        this.gameController.init();
    }

    getBlockStones(){
        this.emit('change', _block_stones);
    }
}
