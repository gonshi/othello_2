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

/**
 * @param {x} int
 * @param {y} int
 * @param {player} int
 * @return {is_returned} boolean
 *
 * check if the put position can be put, and if true, reverse the target stones.
 */
function reverseStone(x, y, player){
    const VECTOR = [
        [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]
    ];
    var target = player === 1 ? 2 : 1;
    var is_reversed = false;

    for(var i = 0; i < VECTOR.length; i++){
        let _x = x + VECTOR[i][0];
        let _y = y + VECTOR[i][1];
        let reverse_count = 0;

        while(_block_stones[_y] && _block_stones[_y][_x] && _block_stones[_y][_x] === target){
            reverse_count += 1;
            _x += VECTOR[i][0];
            _y += VECTOR[i][1];
        }

        if(reverse_count > 0 && _block_stones[_y][_x] === player){
            let block_x = x + VECTOR[i][0];
            let block_y = y + VECTOR[i][1];

            for(let block_i = 0; block_i < reverse_count; block_i++){
                _block_stones[block_y][block_x] = player;
                block_x += VECTOR[i][0];
                block_y += VECTOR[i][1];
            }
            is_reversed = true;
        }
    }

    return is_reversed;
}

/**
 * @param {x} int
 * @param {y} int
 * @param {player} int
 * @return {is_put_succeed} boolean
 *
 * check if the put position is empty, and if true,
 * check if the stone will reverse opposites.
 */
function updateStone(x, y, player){
    if(_block_stones[y][x] === 0 && reverseStone(x, y, player)){
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

    /**
     * set event listenter that update stone status.
     */
    init(){
        this.player = 0;

        this.gameController.on('put_stone', (x, y, width, height) => {
            // calc block position x & y
            var block_x = Math.floor(x / (width / _block_stones.length));
            var block_y = Math.floor(y / (height / _block_stones.length));

            // check if the player can put on the block position
            var is_put_succeed = updateStone(block_x, block_y, (this.player++ % 2) + 1);

            this.emit('change', _block_stones);
            return is_put_succeed;
        });

        this.gameController.init();
    }

    /**
     * emit change event, and return block_stones
     */
    getBlockStones(){
        this.emit('change', _block_stones);
    }
}
