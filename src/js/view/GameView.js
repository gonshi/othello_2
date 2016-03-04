module.exports = class GameView{
    constructor(game_query, result_query){
        this.$game = $(game_query);
        this.$result = $(result_query);
        this.game_context = this.$game.get(0).getContext('2d');
    }

    init(){
        this.setSize();
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
        this.game_context.lineWidth = 2;

        // stroke line
        this.game_context.strokeStyle = '#000';
        for(let i = 0; i <= block_stones.length; i++){
            // vertical
            this.game_context.beginPath();
            this.game_context.moveTo(this.game_width / block_stones.length * i, 0);
            this.game_context.lineTo(this.game_width / block_stones.length * i, this.game_height);
            this.game_context.stroke();
            this.game_context.closePath();

            // horizon
            this.game_context.beginPath();
            this.game_context.moveTo(0, this.game_height / block_stones.length * i);
            this.game_context.lineTo(this.game_width, this.game_height / block_stones.length * i);
            this.game_context.stroke();
            this.game_context.closePath();
        }

        // draw stone
        for(let x = 0; x < block_stones.length; x++){
            for(let y = 0; y < block_stones.length; y++){
                switch(block_stones[y][x]){
                    case 1:
                        this.game_context.strokeStyle = '#000';
                        this.game_context.fillStyle = '#000';
                        break;
                    case 2:
                        this.game_context.strokeStyle = '#000';
                        this.game_context.fillStyle = '#fff';
                        break;
                    default:
                        this.game_context.strokeStyle = '#fff';
                        this.game_context.fillStyle = '#fff';
                        break;
                }
                this.game_context.beginPath();
                this.game_context.arc(
                    (x + 0.5) * this.game_width / block_stones.length,
                    (y + 0.5) * this.game_height / block_stones.length,
                    22, 0, 2 * Math.PI
                );
                this.game_context.stroke();
                this.game_context.fill();
                this.game_context.closePath();
            }
        }
    }

    fin(winner_id){
        const PLAYER_NAME = ['黒', '白'];
        this.$result.addClass('is_show').text(`${PLAYER_NAME[winner_id - 1]}の勝ち`);
    }
}
