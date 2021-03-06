var EventEmitter = require('eventemitter3');

module.exports = class GameController extends EventEmitter{
    constructor(query){
        super();
        this.$game = $(query);
        this.is_pause = false;
    }

    /**
     * set click event on the game board.
     */
    init(){
        FastClick.attach(this.$game.get(0));
        this.$game.on('click', (e) => {
            if(!this.is_pause) this.put(e);
        });

        this.game_width = this.$game.width();
        this.game_height = this.$game.height();
    }

    /**
     * emit put_stone event, and send position information.
     */
    put(e){
        this.emit(
            'put_stone',
            e.offsetX, e.offsetY,
            this.game_width, this.game_height
        );
    }

    /**
     * pause
     */
    pause(){
        this.is_pause = true;
    }

    /**
     * restart
     */
    restart(){
        this.is_pause = false;
    }
}
