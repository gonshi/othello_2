var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');

class Main{
    constructor(){
        this.gameModel = new GameModel();
        this.gameView = new GameView('.game');
    }

    init(){
        this.gameModel.on('change', (block_stones) => {
            this.gameView.draw();
        });

        this.gameModel.init();
        this.gameView.init();
    }
}
var main = new Main();
main.init();
