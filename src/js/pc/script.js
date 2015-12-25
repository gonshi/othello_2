(function(win = window, doc = document){
    'use strict'

    class Test{
        constructor(){
            this.initialize();
        }
        initialize(name = 'Hello World!'){
            this.name = name;
            this.hello(this.name);
        }
        hello(str){
            console.log(str);
        }
    }

    var test = new Test();
})();
