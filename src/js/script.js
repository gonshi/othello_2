var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');

class Main{
    constructor(){
        this.gameModel = new GameModel();
        this.gameView = new GameView('.game', '.result');
    }

    init(){
        this.gameModel.on('change', (block_stones) => {
            this.render(block_stones);
        });

        this.gameModel.on('fin', (winner_id) => {
            this.gameView.fin(winner_id);
        });

        this.gameModel.init();
        this.gameView.init();

        this.gameModel.getBlockStones();
    }

    render(block_stones){
        this.gameView.draw(block_stones);
    }
}
var main = new Main();
main.init();
