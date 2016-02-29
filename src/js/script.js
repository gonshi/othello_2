var GameModel = require('./model/GameModel');

class Main{
    constructor(){
        this.gameModel = new GameModel();
    }

    init(){
        this.gameModel.on('change', (block_stones) => {
            console.log(block_stones);
        });

        this.gameModel.init();
    }
}
var main = new Main();
main.init();
