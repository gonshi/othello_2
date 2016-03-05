(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;
  else {
    if (!this._events[evt].fn) this._events[evt].push(listener);
    else this._events[evt] = [
      this._events[evt], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt]
    , events = [];

  if (fn) {
    if (listeners.fn) {
      if (
           listeners.fn !== fn
        || (once && !listeners.once)
        || (context && listeners.context !== context)
      ) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (
             listeners[i].fn !== fn
          || (once && !listeners[i].once)
          || (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];
  else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter3');

module.exports = function (_EventEmitter) {
    _inherits(GameController, _EventEmitter);

    function GameController(query) {
        _classCallCheck(this, GameController);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GameController).call(this));

        _this.$game = $(query);
        return _this;
    }

    /**
     * set click event on the game board.
     */


    _createClass(GameController, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            FastClick.attach(this.$game.get(0));
            this.$game.on('click', function (e) {
                _this2.put(e);
            });

            this.game_width = this.$game.width();
            this.game_height = this.$game.height();
        }

        /**
         * emit put_stone event, and send position information.
         */

    }, {
        key: 'put',
        value: function put(e) {
            this.emit('put_stone', e.offsetX, e.offsetY, this.game_width, this.game_height);
        }
    }]);

    return GameController;
}(EventEmitter);

},{"eventemitter3":1}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter3');
var GameController = require('../controller/GameController');
var Milkcocoa = require('../module/Milkcocoa');

var _block_stones = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 1, 2, 0, 0], [0, 0, 2, 1, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];

/**
 * @param {x} int
 * @param {y} int
 * @param {player} int
 * @return {is_returned} boolean
 *
 * check if the put position can be put, and if true, reverse the target stones.
 */
function reverseStone(x, y, player) {
    var VECTOR = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];
    var target = player === 1 ? 2 : 1;
    var is_reversed = false;

    for (var i = 0; i < VECTOR.length; i++) {
        var _x = x + VECTOR[i][0];
        var _y = y + VECTOR[i][1];
        var reverse_count = 0;

        while (_block_stones[_y] && _block_stones[_y][_x] === target) {
            reverse_count += 1;
            _x += VECTOR[i][0];
            _y += VECTOR[i][1];
        }

        if (reverse_count > 0 && _block_stones[_y] && _block_stones[_y][_x] === player) {
            var block_x = x + VECTOR[i][0];
            var block_y = y + VECTOR[i][1];

            for (var block_i = 0; block_i < reverse_count; block_i++) {
                _block_stones[block_y][block_x] = player;
                block_x += VECTOR[i][0];
                block_y += VECTOR[i][1];
            }
            is_reversed = true;
        }
    }

    return is_reversed;
}

/**
 * @param {x} int
 * @param {y} int
 * @param {player} int
 * @return {is_put_succeed} boolean
 *
 * check if the put position is empty, and if true,
 * check if the stone will reverse opposites.
 */
function updateStone(x, y, player) {
    if (_block_stones[y][x] === 0 && reverseStone(x, y, player)) {
        _block_stones[y][x] = player;
        return true;
    } else {
        return false;
    }
}

module.exports = function (_EventEmitter) {
    _inherits(GameModel, _EventEmitter);

    function GameModel() {
        _classCallCheck(this, GameModel);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GameModel).call(this));

        _this.gameController = new GameController('.game');
        _this.milkcocoa = new Milkcocoa('maxilep2vor', 'datastore');
        return _this;
    }

    /**
     * set event listenter that update stone status.
     */


    _createClass(GameModel, [{
        key: 'init',
        value: function init(player_id) {
            var _this2 = this;

            if (player_id) {
                this.player_id = player_id;
            } else {
                // play with computer
                this.player_id = 1;
                this.initComputer();
            }

            this.gameController.on('put_stone', function (x, y, width, height) {
                // calc block position x & y
                var block_x = Math.floor(x / (width / _block_stones.length));
                var block_y = Math.floor(y / (height / _block_stones.length));
                _this2.milkcocoa.send({
                    x: block_x,
                    y: block_y,
                    player_id: _this2.player_id
                });
            });

            this.milkcocoa.on('send', function (arg) {
                _this2.putStone(arg.x, arg.y, arg.player_id);
            });

            this.gameController.init();
            this.milkcocoa.init();
        }

        /**
         * try to put stone on the x, y position.
         */

    }, {
        key: 'putStone',
        value: function putStone(x, y, player_id) {
            // check if the player can put on the block position
            var is_put_succeed = updateStone(x, y, player_id);

            if (is_put_succeed) {
                this.checkFin();
                this.emit('change', _block_stones);
            }
            return is_put_succeed;
        }

        /**
         * search put position automatically for computer.
         */

    }, {
        key: 'searchPut',
        value: function searchPut() {
            var player_id = 2;
            loop: for (var block_y = 0; block_y < _block_stones.length; block_y++) {
                for (var block_x = 0; block_x < _block_stones.length; block_x++) {
                    if (this.putStone(block_x, block_y, player_id)) {
                        break loop;
                    }
                }
            }
        }

        /**
         * init computer manipulation.
         */

    }, {
        key: 'initComputer',
        value: function initComputer() {
            var _this3 = this;

            setInterval(function () {
                _this3.searchPut();
            }, 1000);
        }

        /**
         * check if the game has finished, and if finished,
         * emit fin event and send the winner id.
         */

    }, {
        key: 'checkFin',
        value: function checkFin() {
            var player_count = [0, 0, 0];

            for (var block_y = 0; block_y < _block_stones.length; block_y++) {
                for (var block_x = 0; block_x < _block_stones.length; block_x++) {
                    player_count[_block_stones[block_y][block_x]] += 1;
                }
            }

            for (var i = 0; i < player_count.length; i++) {
                if (player_count[i] === 0) {
                    if (player_count[1] > player_count[2]) {
                        this.emit('fin', 1);
                    } else {
                        this.emit('fin', 2);
                    }
                }
            }
        }

        /**
         * emit change event, and return block_stones
         */

    }, {
        key: 'getBlockStones',
        value: function getBlockStones() {
            this.emit('change', _block_stones);
        }
    }]);

    return GameModel;
}(EventEmitter);

},{"../controller/GameController":2,"../module/Milkcocoa":4,"eventemitter3":1}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter3');

module.exports = function (_EventEmitter) {
    _inherits(Milkcocoa, _EventEmitter);

    function Milkcocoa(app_id, datastore) {
        _classCallCheck(this, Milkcocoa);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Milkcocoa).call(this));

        _this.app = new MilkCocoa(app_id + '.mlkcca.com');
        _this.datastore = _this.app.dataStore(datastore);
        return _this;
    }

    _createClass(Milkcocoa, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            this.datastore.on('send', function (arg) {
                _this2.emit('send', arg.value);
            });
        }
    }, {
        key: 'send',
        value: function send(object) {
            this.datastore.send(object);
        }
    }]);

    return Milkcocoa;
}(EventEmitter);

},{"eventemitter3":1}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');

var Main = function () {
    function Main() {
        _classCallCheck(this, Main);

        this.gameModel = new GameModel();
        this.gameView = new GameView('.game', '.result');
    }

    _createClass(Main, [{
        key: 'init',
        value: function init() {
            var _this = this;

            this.gameModel.on('change', function (block_stones) {
                _this.render(block_stones);
            });

            this.gameModel.on('fin', function (winner_id) {
                _this.gameView.fin(winner_id);
            });

            if (location.search.match('match')) {
                if (location.search.match(/match=(.*?)($|\&)/)) {
                    var player_id = 2;
                    //this.gameModel.init(player_id);
                } else {
                        var player_id = 1;
                        var match_id = Math.floor(Math.random() * 1000);
                        this.gameView.showQR('.qr', match_id);
                        //this.gameModel.init(player_id);
                    }
            } else {
                    this.gameModel.init(); // play with computer
                }

            this.gameView.init();

            this.gameModel.getBlockStones();
        }
    }, {
        key: 'render',
        value: function render(block_stones) {
            this.gameView.draw(block_stones);
        }
    }]);

    return Main;
}();

var main = new Main();
main.init();

},{"./model/GameModel":3,"./view/GameView":6}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function GameView(game_query, result_query) {
        _classCallCheck(this, GameView);

        this.$game = $(game_query);
        this.$result = $(result_query);
        this.game_context = this.$game.get(0).getContext('2d');
    }

    _createClass(GameView, [{
        key: 'init',
        value: function init() {
            this.setSize();
        }

        /**
         * set game DOM size
         */

    }, {
        key: 'setSize',
        value: function setSize() {
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

    }, {
        key: 'draw',
        value: function draw(block_stones) {
            this.game_context.clearRect(0, 0, this.game_width, this.game_height);
            this.game_context.lineWidth = 2;

            // stroke line
            this.game_context.strokeStyle = '#000';
            for (var i = 0; i <= block_stones.length; i++) {
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
            for (var x = 0; x < block_stones.length; x++) {
                for (var y = 0; y < block_stones.length; y++) {
                    switch (block_stones[y][x]) {
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
                    this.game_context.arc((x + 0.5) * this.game_width / block_stones.length, (y + 0.5) * this.game_height / block_stones.length, 22, 0, 2 * Math.PI);
                    this.game_context.stroke();
                    this.game_context.fill();
                    this.game_context.closePath();
                }
            }
        }

        /**
         * show winner information.
         */

    }, {
        key: 'fin',
        value: function fin(winner_id) {
            var PLAYER_NAME = ['黒', '白'];
            this.$result.addClass('is_show').text(PLAYER_NAME[winner_id - 1] + 'の勝ち');
        }

        /**
         * show qr code for matching.
         */

    }, {
        key: 'showQR',
        value: function showQR(qr_query, match_id) {
            var $qr = $(qr_query);

            $qr.addClass('is_show');
            $qr.find('img').attr({
                src: 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + location.origin + '?match=' + match_id
            });
        }
    }]);

    return GameView;
}();

},{}]},{},[5]);
