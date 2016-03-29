module.exports = class Sound{
    constructor(){
        boombox.setup();
    }

    init(){
        boombox.load('sound', require('../../../dist/audio/boombox-output.json'), function (err, audio) {
        });
    }

    play(id){
        if(boombox.get(`sound-${id}`)) boombox.get(`sound-${id}`).play();
    }

    playBGM(){
        boombox.get('sound-bgm').setLoop(boombox.LOOP_NATIVE);
        boombox.get('sound-bgm').play();
    }
}
