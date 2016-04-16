var EventEmitter = require('eventemitter3');

module.exports = class Sound extends EventEmitter{
    constructor(){
        super();
        boombox.setup();
    }

    init(){
        boombox.load('sound', require('../../../dist/audio/boombox-output.json'), (err, audio) => {
            setTimeout(() => {this.emit('load');}, 500);
        });
    }

    play(id){
        if(boombox.get(`sound-${id}`)) boombox.get(`sound-${id}`).play();
    }

    stop(id){
        if(boombox.get(`sound-${id}`)) boombox.get(`sound-${id}`).stop();
    }

    changeVolume(id, volume){
        boombox.get(`sound-${id}`).volume(volume);
    }

    playBGM(){
        boombox.get('sound-bgm').setLoop(boombox.LOOP_NATIVE);
        boombox.get('sound-bgm').play();
    }
}
