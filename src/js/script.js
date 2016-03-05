var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');
var Milkcocoa = require('./module/Milkcocoa');

class Main{
    constructor(){
        this.gameModel = new GameModel();
        this.gameView = new GameView('.game', '.result');
        this.milkcocoa = new Milkcocoa('maxilep2vor', 'othello2');
    }

    init(){
        var player_id;

        this.gameModel.on('change', (block_stones) => {
            this.render(block_stones);
        });

        this.gameModel.on('fin', (winner_id) => {
            this.gameView.fin(winner_id);
        });

        this.milkcocoa.on('send', (arg) => {
            if(arg.event !== 'start') return;
            this.gameView.hideQR('.qr');
            this.gameModel.init(player_id);
        });

        this.gameView.init();
        this.milkcocoa.init();

        if(location.search.match('match')){
            if(location.search.match(/match=(.*?)($|\&)/)){
                player_id = 2;
            }
            else{
                player_id = 1;
                let match_id = Math.floor(Math.random() * 1000);
                this.gameView.showQR('.qr', match_id);
            }
        }
        else{
            this.milkcocoa.send({event: 'start'});
        }

        this.gameModel.getBlockStones();
    }

    render(block_stones){
        this.gameView.draw(block_stones);
    }
}
var main = new Main();
main.init();
