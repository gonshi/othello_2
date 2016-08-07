var EventEmitter = require('eventemitter3');
var GameController = require('../controller/GameController');
var Milkcocoa = require('../module/Milkcocoa');

var _origin_block_stones = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

var _block_stones = [];
var _can_put = true;

/**
 * set origin block stones to block stones.
 */
function setOriginBlockStone(){
    for(let y = 0; y < _origin_block_stones.length; y++){
        _block_stones[y] = [];
        for(let x = 0; x < _origin_block_stones[y].length; x++){
            _block_stones[y][x] = _origin_block_stones[y][x];
        }
    }
}

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

        while(_block_stones[_y] && _block_stones[_y][_x] === target){
            reverse_count += 1;
            _x += VECTOR[i][0];
            _y += VECTOR[i][1];
        }

        if(reverse_count > 0 && _block_stones[_y] && _block_stones[_y][_x] === player){
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
        setOriginBlockStone();
        this.gameController = new GameController('.game');
        this.milkcocoa = new Milkcocoa('maxilep2vor', 'othello2');
    }

    /**
     * set event listenter that update stone status.
     */
    init(player_id, match_id){
        if(!player_id){ // play with computer
            player_id = 1;
            this.initComputer();
        }

        this.gameController.on('put_stone', (x, y, width, height) => {
            // calc block position x & y
            var block_x = Math.floor(x / (width / _block_stones.length));
            var block_y = Math.floor(y / (height / _block_stones.length));

            if(_can_put){
                this.milkcocoa.send({
                    event: 'put',
                    x: block_x,
                    y: block_y,
                    player_id: player_id,
                    match_id: match_id,
                });
            }
        });

        this.milkcocoa.on('send', (arg) => {
            if(arg.event !== 'put' || arg.match_id !== match_id) return;

            let is_put_succeed = this.putStone(arg.x, arg.y, arg.player_id);
            if(!is_put_succeed && arg.player_id === player_id){
                const MAX_WAIT = 3000;
                let put_stone_count = 0;

                for(let block_y = 0; block_y < _block_stones.length; block_y++){
                    for(let block_x = 0; block_x < _block_stones.length; block_x++){
                        if(_block_stones[block_y][block_x] !== 0){
                            put_stone_count += 1;
                        }
                    }
                }

                this.wait('.penalty', put_stone_count / Math.pow(_block_stones.length, 2) * MAX_WAIT);
            }
        });

        this.gameController.init();
        this.milkcocoa.init();
    }

    /**
     * try to put stone on the x, y position.
     */
    putStone(x, y, player_id){
        // check if the player can put on the block position
        var is_put_succeed = updateStone(x, y, player_id);

        if(is_put_succeed){
            this.checkFin();
            this.emit('change', _block_stones);
        }
        else{
            this.emit('put');
        }
        return is_put_succeed;
    }

    /**
     * search put position automatically for computer.
     */
    searchPut(){
        var player_id = 2;
        loop: for(let block_y = 0; block_y < _block_stones.length; block_y++){
            for(let block_x = 0; block_x < _block_stones.length; block_x++){
                if(this.putStone(block_x, block_y, player_id)){
                    break loop;
                }
            }
        }
    }

    /**
     * init computer manipulation.
     */
    initComputer(){
        this.computer_interval =
            setInterval(() => {this.searchPut();}, 1000);
    }

    /**
     * stop computer manipulation.
     */
    stopComputer(){
        clearInterval(this.computer_interval);
    }

    /**
     * check if the game has finished, and if finished,
     * emit fin event and send the winner id.
     */
    checkFin(){
        var player_count = [0, 0, 0];

        for(let block_y = 0; block_y < _block_stones.length; block_y++){
            for(let block_x = 0; block_x < _block_stones.length; block_x++){
                player_count[_block_stones[block_y][block_x]] += 1;
            }
        }

        for(let i = 0; i < player_count.length; i++){
            if(player_count[i] === 0){
                if(player_count[1] > player_count[2]){
                    this.emit('fin', 1);
                }
                else{
                    this.emit('fin', 2);
                }
                this.releasePenalty('.penalty');
                this.stopComputer();
            }
        }
    }

    /**
     * wait required seconds.
     * it's usually called when misstouched.
     */
    wait(penalty_query, seconds){
        let $penalty = $(penalty_query);
        $penalty.addClass('is_show');

        _can_put = false;
        setTimeout(() => {
            $penalty.removeClass('is_show');
            _can_put = true;
            this.emit('fin_penalty');
        }, seconds);

        this.emit('start_penalty');
    }

    /**
     * release penalty forcibly
     */
    releasePenalty(penalty_query){
        let $penalty = $(penalty_query);
        $penalty.removeClass('is_show');
        _can_put = true;
        this.emit('fin_penalty');
    }

    /**
     * emit change event, and return block_stones
     */
    getBlockStones(){
        this.emit('change', _block_stones);
    }

    /**
     * reset all block stones
     */
    reset(){
        setOriginBlockStone();
    }

    /**
     * pause controller
     */
    pauseController(){
        this.gameController.pause();
    }

    /**
     * restart controller
     */
    restartController(){
        this.gameController.restart();
    }
}
