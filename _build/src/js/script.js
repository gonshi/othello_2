var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');
var Milkcocoa = require('./module/Milkcocoa');
var Sound = require('./module/Sound');

class Main{
    constructor(){
        this.gameModel = new GameModel();
        this.gameView = new GameView('.game');
        this.milkcocoa = new Milkcocoa('maxilep2vor', 'othello2');
        this.sound = new Sound();

        this.$retry = $('.retry');
        this.$score = $('.score');
        this.$score_player_1 = $('.score__player-1');
        this.$score_player_2 = $('.score__player-2');
    }

    init(){
        var player_id;
        var match_id;
        const CHANGE_SOUND_SIZE = 3;
        const PUT_SOUND_SIZE = 4;

        this.gameModel.on('change', (block_stones) => {
            this.block_stones = block_stones;
            this.sound.play(`change_${Math.floor(Math.random() * CHANGE_SOUND_SIZE + 1)}`);
        });

        this.gameModel.on('change', (block_stones) => {
            this.sound.play(`put_${Math.floor(Math.random() * PUT_SOUND_SIZE + 1)}`);
        });

        this.gameModel.on('start_penalty', () => {
            this.sound.changeVolume('bgm', 0.3);
            for(let i = 0; i < CHANGE_SOUND_SIZE; i++)
                this.sound.changeVolume(`change_${i + 1}`, 0.3);

            for(let i = 0; i < PUT_SOUND_SIZE; i++)
                this.sound.changeVolume(`put_${i + 1}`, 0.3);

            this.sound.play('penalty');
        });

        this.gameModel.on('fin_penalty', () => {
            this.sound.changeVolume('bgm', 1);
            for(let i = 0; i < CHANGE_SOUND_SIZE; i++)
                this.sound.changeVolume(`change_${i + 1}`, 1);

            for(let i = 0; i < PUT_SOUND_SIZE; i++)
                this.sound.changeVolume(`put_${i + 1}`, 1);

            this.sound.stop('penalty');
        });

        this.gameModel.on('fin', (player_1_score, player_2_score) => {
            if(!player_id) player_id = 1; // when played with computer
            let winner_id = player_1_score > player_2_score ? 1 : 2;
            let is_win = winner_id === player_id;
            this.gameModel.pauseController();
            this.gameView.fin('.result', is_win);
            this.sound.stop('bgm');
            this.sound.play('result');

            setTimeout(() => {
                this.$retry.addClass('is_show');
                this.$score.addClass('is_show');
                this.$score_player_1.text(player_1_score);
                this.$score_player_2.text(player_2_score);
            }, 1000);
        });

        this.milkcocoa.on('send', (arg) => {
            if(arg.event !== 'start' || arg.match_id !== match_id) return;
            this.gameView.hideQR('.qr');
            this.gameView.countdown('.countdown', () => {
                this.gameModel.init(player_id, match_id);
                this.sound.playBGM();
            });
            this.sound.play('countdown');
        });

        this.milkcocoa.on('send', (arg) => {
            if(arg.event !== 'restart' || arg.match_id !== match_id) return;
            this.restart();
        });

        this.sound.on('load', () => {
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
        });

        this.$retry.on('click', () => {
            setTimeout(() => {
                this.milkcocoa.send({
                    event: 'restart',
                    match_id: match_id,
                });
            }, 500);
        });

        this.gameView.init();
        this.milkcocoa.init();

        this.gameModel.getBlockStones();

        this.sound.init();

        requestAnimationFrame(() => {this.render();});
    }

    restart(){
        this.$retry.removeClass('is_show');
        this.$score.removeClass('is_show');
        this.gameView.reset('.result');
        this.gameView.countdown('.countdown', () => {
            if(!location.search.match('match')) this.gameModel.initComputer();
            this.gameModel.restartController();
            this.sound.playBGM();
        });
        this.gameModel.reset();
        this.sound.play('countdown');
        this.gameModel.getBlockStones();
    }

    render(){
        this.gameView.draw(this.block_stones);
        requestAnimationFrame(() => {this.render();});
    }
}
var main = new Main();
main.init();
