var EventEmitter = require('eventemitter3');

module.exports = class GameController extends EventEmitter{
    constructor(query){
        super();
        this.$game = $(query);
    }

    init(){
        this.$game.on('click', (e) => {this.put(e);});

        this.game_width = this.$game.width();
        this.game_height = this.$game.height();
    }

    put(e){
        this.emit(
            'put_stone',
            e.offsetX, e.offsetY,
            this.game_width, this.game_height
        );
    }
}
