module.exports = class GameView{
    constructor(game_query){
        this.$game = $(game_query);
        this.game_context = this.$game.get(0).getContext('2d');
    }

    init(){
        this.setSize();

        this.stone_img = {
            black: new Image(),
            white: new Image()
        };
        this.stone_img.black.src = 'img/stone_black.png';
        this.stone_img.white.src = 'img/stone_white.png';

        this.board_img = new Image();
        this.board_img.src = 'img/board.jpg';

        if(window.large){
            this.board_img.src = 'img/board_large.jpg';
        }
    }

    /**
     * set game DOM size
     */
    setSize(){
        this.game_width = this.$game.width();
        this.game_height = this.$game.height();

        this.$game.attr({
            width: this.game_width,
            height: this.game_height
        });
    }

    /**
     * draw stones and lines.
     */
    draw(block_stones){
        this.game_context.clearRect(0, 0, this.game_width, this.game_height);

        this.game_context.drawImage(this.board_img, 0, 0, this.board_img.width / 2, this.board_img.height / 2);

        // draw stone
        for(let x = 0; x < block_stones.length; x++){
            for(let y = 0; y < block_stones.length; y++){
                var stone_img;
                switch(block_stones[y][x]){
                    case 1:
                        stone_img = this.stone_img.white;
                        break;
                    case 2:
                        stone_img = this.stone_img.black;
                        break;
                    default:
                        stone_img = null;
                        break;
                }
                if(stone_img){
                    const PADDING = window.large ? 10 : 15;
                    const OFFSET = window.large ? 10 : 18;

                    this.game_context.drawImage(stone_img,
                        x * (this.game_width - PADDING * 2) / block_stones.length + OFFSET,
                        y * (this.game_height - PADDING * 2) / block_stones.length + OFFSET,
                        stone_img.width / 2, stone_img.height / 2
                    );
                }
            }
        }
    }

    /**
     * show winner information.
     */
    fin(result_query, is_win){
        var $result = $(result_query);
        $result.attr({'data-is-win': is_win})
    }

    /**
     * show username in response to the player_id.
     */
    showUserstone(userstone_query, player_id = 1){
        var $username = $(userstone_query);
        $username.filter(`[data-id='${player_id}']`).addClass('is_me');
    }

    /**
     * show qr code for matching.
     */
    showQR(qr_query, match_id){
        var $qr = $(qr_query);

        $qr.addClass('is_show');
        $qr.find('img').attr({
            src: `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${location.origin}${location.pathname}?match=${match_id}`
        });
    }

    /**
     * hide qr code.
     */
    hideQR(qr_query){
        var $qr = $(qr_query);
        $qr.removeClass('is_show');
    }

    /**
     * show countdown animation.
     */
    countdown(countdown_query, callback){
        var $countdown = $(countdown_query);
        var count = 3;

        var interval = setInterval(function(){
            $countdown.removeClass('is_show');

            setTimeout(function(){
                if(count > 0) $countdown.attr({'data-id': count});

                $countdown.addClass('is_show');

                if(--count <= 0){
                    clearInterval(interval);
                    setTimeout(function(){
                        $countdown.removeClass('is_show');
                        callback();
                    }, 800);
                }
            }, 50);
        }, 1000);

        $countdown.attr({'data-id': count--});
        $countdown.addClass('is_show');
    }

    /**
     * reset all views
     */
    reset(result_query){
        var $result = $(result_query);
        $result.attr({'data-is-win': ''})
    }
}
