var EventEmitter = require('eventemitter3');
var GameController = require('../controller/GameController');

var _block_stones = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 2, 0, 0],
    [0, 0, 2, 1, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
];

function updateStone(x, y, player){
    if(_block_stones[y][x] === 0){
        _block_stones[y][x] = player;
        return true;
    }
    else{
        return false;
    }
}

module.exports = class GameModel extends EventEmitter{
    constructor(){
        super();
        this.gameController = new GameController('.game');
    }

    init(){
        this.gameController.on('put_stone', (x, y, width, height) => {
            var block_x = Math.floor(x / (width / _block_stones.length));
            var block_y = Math.floor(y / (height / _block_stones.length));
            var is_put_succeed = updateStone(block_x, block_y, 1);
            this.emit('change', _block_stones);
            return is_put_succeed;
        });

        this.gameController.init();
    }

    getBlockStones(){
        this.emit('change', _block_stones);
    }
}
