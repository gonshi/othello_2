(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "spritemap": {
    "bgm": {
      "start": 0,
      "end": 102.06040816326531
    },
    "change_1": {
      "start": 104,
      "end": 105.78789115646258
    },
    "change_2": {
      "start": 107,
      "end": 109.32850340136055
    },
    "change_3": {
      "start": 111,
      "end": 111.3843537414966
    },
    "countdown": {
      "start": 113,
      "end": 117.57142857142857
    },
    "penalty": {
      "start": 119,
      "end": 125.45585034013605
    },
    "put_1": {
      "start": 127,
      "end": 128.24374149659863
    },
    "put_2": {
      "start": 130,
      "end": 131.18709750566893
    },
    "put_3": {
      "start": 133,
      "end": 134.08435374149659
    },
    "put_4": {
      "start": 136,
      "end": 136.48396825396824
    },
    "result": {
      "start": 138,
      "end": 144.03428571428572
    },
    "select": {
      "start": 146,
      "end": 147.5673469387755
    }
  },
  "src": [
    {
      "media": "audio/mpeg",
      "path": "audio/output.mp3"
    }
  ]
}
},{}],2:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

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
 * @param {Boolean} [once=false] Only emit once
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
 * Hold the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var events = this._events
    , names = []
    , name;

  if (!events) return names;

  for (name in events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

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
 * @param {Function} fn Callback function.
 * @param {Mixed} [context=this] The context of the function.
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
 * @param {Mixed} [context=this] The context of the function.
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

},{}],3:[function(require,module,exports){
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
        _this.is_pause = false;
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
                if (!_this2.is_pause) _this2.put(e);
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

        /**
         * pause
         */

    }, {
        key: 'pause',
        value: function pause() {
            this.is_pause = true;
        }

        /**
         * restart
         */

    }, {
        key: 'restart',
        value: function restart() {
            this.is_pause = false;
        }
    }]);

    return GameController;
}(EventEmitter);

},{"eventemitter3":2}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter3');
var GameController = require('../controller/GameController');
var Milkcocoa = require('../module/Milkcocoa');

var _origin_block_stones = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

var _block_stones = [];
var _can_put = true;

/**
 * set origin block stones to block stones.
 */
function setOriginBlockStone() {
    for (var y = 0; y < _origin_block_stones.length; y++) {
        _block_stones[y] = [];
        for (var x = 0; x < _origin_block_stones[y].length; x++) {
            _block_stones[y][x] = _origin_block_stones[y][x];
        }
    }
}

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

        setOriginBlockStone();
        _this.gameController = new GameController('.game');
        _this.milkcocoa = new Milkcocoa('maxilep2vor', 'othello2');
        return _this;
    }

    /**
     * set event listenter that update stone status.
     */


    _createClass(GameModel, [{
        key: 'init',
        value: function init(player_id, match_id) {
            var _this2 = this;

            if (!player_id) {
                // play with computer
                player_id = 1;
                this.initComputer();
            }

            this.gameController.on('put_stone', function (x, y, width, height) {
                // calc block position x & y
                var block_x = Math.floor(x / (width / _block_stones.length));
                var block_y = Math.floor(y / (height / _block_stones.length));

                if (_can_put) {
                    _this2.milkcocoa.send({
                        event: 'put',
                        x: block_x,
                        y: block_y,
                        player_id: player_id,
                        match_id: match_id
                    });
                }
            });

            this.milkcocoa.on('send', function (arg) {
                if (arg.event !== 'put' || arg.match_id !== match_id) return;

                var is_put_succeed = _this2.putStone(arg.x, arg.y, arg.player_id);
                if (!is_put_succeed && arg.player_id === player_id) {
                    var MAX_WAIT = 3000;
                    var put_stone_count = 0;

                    for (var block_y = 0; block_y < _block_stones.length; block_y++) {
                        for (var block_x = 0; block_x < _block_stones.length; block_x++) {
                            if (_block_stones[block_y][block_x] !== 0) {
                                put_stone_count += 1;
                            }
                        }
                    }

                    _this2.wait('.penalty', put_stone_count / Math.pow(_block_stones.length, 2) * MAX_WAIT);
                }
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
            } else {
                this.emit('put');
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

            this.computer_interval = setInterval(function () {
                _this3.searchPut();
            }, 1000);
        }

        /**
         * stop computer manipulation.
         */

    }, {
        key: 'stopComputer',
        value: function stopComputer() {
            clearInterval(this.computer_interval);
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
                    this.releasePenalty('.penalty');
                    this.stopComputer();
                }
            }
        }

        /**
         * wait required seconds.
         * it's usually called when misstouched.
         */

    }, {
        key: 'wait',
        value: function wait(penalty_query, seconds) {
            var _this4 = this;

            var $penalty = $(penalty_query);
            $penalty.addClass('is_show');

            _can_put = false;
            setTimeout(function () {
                $penalty.removeClass('is_show');
                _can_put = true;
                _this4.emit('fin_penalty');
            }, seconds);

            this.emit('start_penalty');
        }

        /**
         * release penalty forcibly
         */

    }, {
        key: 'releasePenalty',
        value: function releasePenalty(penalty_query) {
            var $penalty = $(penalty_query);
            $penalty.removeClass('is_show');
            _can_put = true;
            this.emit('fin_penalty');
        }

        /**
         * emit change event, and return block_stones
         */

    }, {
        key: 'getBlockStones',
        value: function getBlockStones() {
            this.emit('change', _block_stones);
        }

        /**
         * reset all block stones
         */

    }, {
        key: 'reset',
        value: function reset() {
            setOriginBlockStone();
        }

        /**
         * pause controller
         */

    }, {
        key: 'pauseController',
        value: function pauseController() {
            this.gameController.pause();
        }

        /**
         * restart controller
         */

    }, {
        key: 'restartController',
        value: function restartController() {
            this.gameController.restart();
        }
    }]);

    return GameModel;
}(EventEmitter);

},{"../controller/GameController":3,"../module/Milkcocoa":5,"eventemitter3":2}],5:[function(require,module,exports){
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

},{"eventemitter3":2}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('eventemitter3');

module.exports = function (_EventEmitter) {
    _inherits(Sound, _EventEmitter);

    function Sound() {
        _classCallCheck(this, Sound);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Sound).call(this));

        boombox.setup();
        return _this;
    }

    _createClass(Sound, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            boombox.load('sound', require('../../../dist/audio/boombox-output.json'), function (err, audio) {
                setTimeout(function () {
                    _this2.emit('load');
                }, 500);
            });
        }
    }, {
        key: 'play',
        value: function play(id) {
            if (boombox.get('sound-' + id)) boombox.get('sound-' + id).play();
        }
    }, {
        key: 'stop',
        value: function stop(id) {
            if (boombox.get('sound-' + id)) boombox.get('sound-' + id).stop();
        }
    }, {
        key: 'changeVolume',
        value: function changeVolume(id, volume) {
            boombox.get('sound-' + id).volume(volume);
        }
    }, {
        key: 'playBGM',
        value: function playBGM() {
            boombox.get('sound-bgm').setLoop(boombox.LOOP_NATIVE);
            boombox.get('sound-bgm').play();
        }
    }]);

    return Sound;
}(EventEmitter);

},{"../../../dist/audio/boombox-output.json":1,"eventemitter3":2}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameModel = require('./model/GameModel');
var GameView = require('./view/GameView');
var Milkcocoa = require('./module/Milkcocoa');
var Sound = require('./module/Sound');

var Main = function () {
    function Main() {
        _classCallCheck(this, Main);

        this.gameModel = new GameModel();
        this.gameView = new GameView('.game');
        this.milkcocoa = new Milkcocoa('maxilep2vor', 'othello2');
        this.sound = new Sound();

        this.$retry = $('.retry');
    }

    _createClass(Main, [{
        key: 'init',
        value: function init() {
            var _this = this;

            var player_id;
            var match_id;
            var CHANGE_SOUND_SIZE = 3;
            var PUT_SOUND_SIZE = 4;

            this.gameModel.on('change', function (block_stones) {
                _this.block_stones = block_stones;
                _this.sound.play('change_' + Math.floor(Math.random() * CHANGE_SOUND_SIZE + 1));
            });

            this.gameModel.on('change', function (block_stones) {
                _this.sound.play('put_' + Math.floor(Math.random() * PUT_SOUND_SIZE + 1));
            });

            this.gameModel.on('start_penalty', function () {
                _this.sound.changeVolume('bgm', 0.3);
                for (var i = 0; i < CHANGE_SOUND_SIZE; i++) {
                    _this.sound.changeVolume('change_' + (i + 1), 0.3);
                }for (var _i = 0; _i < PUT_SOUND_SIZE; _i++) {
                    _this.sound.changeVolume('put_' + (_i + 1), 0.3);
                }_this.sound.play('penalty');
            });

            this.gameModel.on('fin_penalty', function () {
                _this.sound.changeVolume('bgm', 1);
                for (var i = 0; i < CHANGE_SOUND_SIZE; i++) {
                    _this.sound.changeVolume('change_' + (i + 1), 1);
                }for (var _i2 = 0; _i2 < PUT_SOUND_SIZE; _i2++) {
                    _this.sound.changeVolume('put_' + (_i2 + 1), 1);
                }_this.sound.stop('penalty');
            });

            this.gameModel.on('fin', function (winner_id) {
                if (!player_id) player_id = 1; // when played with computer
                var is_win = winner_id === player_id;
                _this.gameModel.pauseController();
                _this.gameView.fin('.result', is_win);
                _this.sound.stop('bgm');
                _this.sound.play('result');

                setTimeout(function () {
                    _this.$retry.addClass('is_show');
                }, 1000);
            });

            this.milkcocoa.on('send', function (arg) {
                if (arg.event !== 'start' || arg.match_id !== match_id) return;
                _this.gameView.hideQR('.qr');
                _this.gameView.countdown('.countdown', function () {
                    _this.gameModel.init(player_id, match_id);
                    _this.sound.playBGM();
                });
                _this.sound.play('countdown');
            });

            this.milkcocoa.on('send', function (arg) {
                if (arg.event !== 'restart' || arg.match_id !== match_id) return;
                _this.restart();
            });

            this.sound.on('load', function () {
                if (location.search.match('match')) {
                    if (location.search.match(/match=(.*?)($|\&)/)) {
                        player_id = 2;
                        match_id = parseInt(location.search.match(/match=(.*?)($|\&)/)[1]);
                        _this.milkcocoa.send({
                            event: 'start',
                            match_id: match_id
                        });
                    } else {
                        player_id = 1;
                        match_id = Math.floor(Math.random() * 1000);
                        _this.gameView.showQR('.qr', match_id);
                    }
                } else {
                    match_id = Math.floor(Math.random() * 1000);
                    _this.milkcocoa.send({
                        event: 'start',
                        match_id: match_id
                    });
                }

                _this.gameView.showUserstone('.userstone', player_id);
            });

            this.$retry.on('click', function () {
                setTimeout(function () {
                    _this.milkcocoa.send({
                        event: 'restart',
                        match_id: match_id
                    });
                }, 500);
            });

            this.gameView.init();
            this.milkcocoa.init();

            this.gameModel.getBlockStones();

            this.sound.init();

            requestAnimationFrame(function () {
                _this.render();
            });
        }
    }, {
        key: 'restart',
        value: function restart() {
            var _this2 = this;

            this.$retry.removeClass('is_show');
            this.gameView.reset('.result');
            this.gameView.countdown('.countdown', function () {
                if (!location.search.match('match')) _this2.gameModel.initComputer();
                _this2.gameModel.restartController();
                _this2.sound.playBGM();
            });
            this.gameModel.reset();
            this.sound.play('countdown');
            this.gameModel.getBlockStones();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            this.gameView.draw(this.block_stones);
            requestAnimationFrame(function () {
                _this3.render();
            });
        }
    }]);

    return Main;
}();

var main = new Main();
main.init();

},{"./model/GameModel":4,"./module/Milkcocoa":5,"./module/Sound":6,"./view/GameView":8}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function GameView(game_query) {
        _classCallCheck(this, GameView);

        this.$game = $(game_query);
        this.game_context = this.$game.get(0).getContext('2d');
    }

    _createClass(GameView, [{
        key: 'init',
        value: function init() {
            this.setSize();

            this.stone_img = {
                black: new Image(),
                white: new Image()
            };
            this.stone_img.black.src = 'img/stone_black.png';
            this.stone_img.white.src = 'img/stone_white.png';

            this.board_img = new Image();
            this.board_img.src = 'img/board_large.jpg';
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

            this.game_context.drawImage(this.board_img, 0, 0, this.board_img.width / 2, this.board_img.height / 2);

            // draw stone
            for (var x = 0; x < block_stones.length; x++) {
                for (var y = 0; y < block_stones.length; y++) {
                    var stone_img;
                    switch (block_stones[y][x]) {
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
                    if (stone_img) {
                        var OFFSET = 10;

                        this.game_context.drawImage(stone_img, x * (this.game_width - OFFSET * 2) / block_stones.length + OFFSET, y * (this.game_height - OFFSET * 2) / block_stones.length + OFFSET, stone_img.width / 2, stone_img.height / 2);
                    }
                }
            }
        }

        /**
         * show winner information.
         */

    }, {
        key: 'fin',
        value: function fin(result_query, is_win) {
            var $result = $(result_query);
            $result.attr({ 'data-is-win': is_win });
        }

        /**
         * show username in response to the player_id.
         */

    }, {
        key: 'showUserstone',
        value: function showUserstone(userstone_query) {
            var player_id = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

            var $username = $(userstone_query);
            $username.filter('[data-id=\'' + player_id + '\']').addClass('is_me');
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
                src: 'https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + location.origin + location.pathname + '?match=' + match_id
            });
        }

        /**
         * hide qr code.
         */

    }, {
        key: 'hideQR',
        value: function hideQR(qr_query) {
            var $qr = $(qr_query);
            $qr.removeClass('is_show');
        }

        /**
         * show countdown animation.
         */

    }, {
        key: 'countdown',
        value: function countdown(countdown_query, callback) {
            var $countdown = $(countdown_query);
            var count = 3;

            var interval = setInterval(function () {
                $countdown.removeClass('is_show');

                setTimeout(function () {
                    if (count > 0) $countdown.attr({ 'data-id': count });

                    $countdown.addClass('is_show');

                    if (--count <= 0) {
                        clearInterval(interval);
                        setTimeout(function () {
                            $countdown.removeClass('is_show');
                            callback();
                        }, 800);
                    }
                }, 50);
            }, 1000);

            $countdown.attr({ 'data-id': count-- });
            $countdown.addClass('is_show');
        }

        /**
         * reset all views
         */

    }, {
        key: 'reset',
        value: function reset(result_query) {
            var $result = $(result_query);
            $result.attr({ 'data-is-win': '' });
        }
    }]);

    return GameView;
}();

},{}]},{},[7]);
