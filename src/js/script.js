var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');

class Main{
    constructor(){
        this.gameModel = new GameModel();
        this.gameView = new GameView('.game');
    }

    init(){
        this.gameModel.on('change', (block_stones) => {
            this.render(block_stones);
        });

        this.gameView.init();
        this.gameModel.init();
        this.gameModel.getBlockStones();
    }

    render(block_stones){
        this.gameView.draw(block_stones);
    }
}
var main = new Main();
main.init();
