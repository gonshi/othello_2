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

        if(location.search.match('match')){
            if(location.search.match(/match=(.*?)($|\&)/)){
                let player_id = 2;
                this.gameModel.init(player_id);
            }
            else{
                let player_id = 1;
                let match_id = Math.floor(Math.random() * 1000);
                this.gameView.showQR('.qr', match_id);
                this.gameModel.init(player_id);
            }
        }
        else{
            this.gameModel.init(); // play with computer
        }

        this.gameView.init();

        this.gameModel.getBlockStones();
    }

    render(block_stones){
        this.gameView.draw(block_stones);
    }
}
var main = new Main();
main.init();
