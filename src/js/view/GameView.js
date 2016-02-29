module.exports = class GameView{
    constructor(query){
        this.$game = $(query);
    }

    init(){
        this.setSize();
    }

    setSize(){
        this.$game.attr({
            width: this.$game.width(),
            height: this.$game.height()
        });
    }
}
