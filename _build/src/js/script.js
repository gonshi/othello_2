var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');
var Milkcocoa = require('./module/Milkcocoa');

class Main{
    constructor(){
        this.gameModel = new GameModel();
        this.gameView = new GameView('.game');
        this.milkcocoa = new Milkcocoa('maxilep2vor', 'othello2');
    }

    init(){
        var player_id;
        var match_id;

        this.gameModel.on('change', (block_stones) => {
            this.block_stones = block_stones;
        });

        requestAnimationFrame(() => {this.render();});

        this.gameModel.on('fin', (winner_id) => {
            if(!player_id) player_id = 1; // when played with computer
            let is_win = winner_id === player_id;
            this.gameView.fin('.result', is_win);
        });

        this.milkcocoa.on('send', (arg) => {
            if(arg.event !== 'start' || arg.match_id !== match_id) return;
            this.gameView.hideQR('.qr');
            this.gameView.countdown('.countdown', () => {
                this.gameModel.init(player_id, match_id);
            });
        });

        this.gameView.init();
        this.milkcocoa.init();

        if(location.search.match('match')){
            if(location.search.match(/match=(.*?)($|\&)/)){
                player_id = 2;
                match_id = parseInt(location.search.match(/match=(.*?)($|\&)/)[1]);
                this.milkcocoa.send({
                    event: 'start',
                    match_id: match_id,
                });
            }
            else{
                player_id = 1;
                match_id = Math.floor(Math.random() * 1000);
                this.gameView.showQR('.qr', match_id);
            }
        }
        else{
            match_id = Math.floor(Math.random() * 1000);
            this.milkcocoa.send({
                event: 'start',
                match_id: match_id,
            });
        }

        this.gameView.showUserstone('.userstone', player_id);
        this.gameModel.getBlockStones();
    }

    render(){
        this.gameView.draw(this.block_stones);
        requestAnimationFrame(() => {this.render();});
    }
}
var main = new Main();
main.init();
