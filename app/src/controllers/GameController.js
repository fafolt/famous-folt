define(function(require, exports, module) {
  
  // ## Controller Base
  var Controller = require('controllers/Controller');

  // ## Configuration
  var StageConfig = require('StageConfig');

  // ## Models
  var UserModel = require('models/UserModel');
  var GameModel = require('models/GameModel');

  function _setListeners() {
    this.on('game:turn++', function() {
      this.addTurn();
    }.bind(this));

    this.on('game:destroyed++', function() {
      this.addDestroyed();
    }.bind(this));

    this.pipe(this._model);
  }

  function _init() {
    var stage = new StageConfig(this.options.stage);
    
    this._stage = stage;
    this._config = stage.getLevelConfig(this.options.level);
    this._model = new GameModel();
    this._user = new UserModel();
  }

  function GameController() {

    if (GameController._instance) {
      return GameController._instance;
    }

    Controller.apply(this, arguments);
    _init.call(this);

    GameController._instance = this;
  }

  GameController.prototype = Object.create(Controller.prototype);
  GameController.prototype.constructor = GameController;

  GameController._instance = null;

  GameController.DEFAULT_OPTIONS = {
    stage: 1,
    level: 1,
    turns: 0,
    destroyed: 0,
    done: false,
    state: null
  };

  GameController.prototype.newGame = function(options) {
    options.destroyed = 0;
    options.turns = 0;
    options.done = false;
    options.state = null;

    this.setOptions(options);

    _init.call(this);
  };

  GameController.prototype.gameOver = function() {
    this.lost();
  };

  GameController.prototype.isSameGame = function(data) {
    return this.options.stage === data.stage && this.options.level === data.level;
  };

  GameController.prototype.getLevelConfig = function() {
    return this._config;
  };

  GameController.prototype.unlockNextLevel = function() {
    // Get Users furthest level and stage
    var levelObj = this._user.getLatestLevel();

    // If this stage/level is Users furthest level and stage increment,
    // otherwise do nothing
    if (levelObj.stage === this.options.stage && levelObj.level === this.options.level) {
      this._user.unlockNextLevel();

      this._eventOutput.emit('game:unlockNextLevel');
    }
  };

  GameController.prototype.getLatestLevel = function() {
    return this._user.getLatestLevel();
  };

  GameController.prototype.getDescription = function() {
    return this._stage.getGameDesc(this.options.level);
  };

  GameController.prototype.getCols = function() {
    return this._config.grid[0];
  };

  GameController.prototype.getStartIndex = function() {
    return this._config.startIndex;
  };

  GameController.prototype.getRows = function() {
    return this._config.grid[1];
  };

  GameController.prototype.addTurn = function() {
    this.options.turns++;
    
    // check win condition
    if (_hasWon.call(this)) this.won();

    // send 'turn++' event to model
    this._eventOutput.emit('game:turn++');
  };

  GameController.prototype.addDestroyed = function() {
    this.options.destroyed++;

    // send 'destroyed++' event to model
    this._eventOutput.emit('game:destroyed++');
  };

  GameController.prototype.doWinCheck = function() {
    if (_hasWon.call(this)) this.won();
  };

  GameController.prototype.won = function() {
    // Send 'won' event
    if (!this.options.done) {
      this._eventOutput.emit('game:won');
      this.options.done = true;
    }
  };

  GameController.prototype.lost = function() {
    // Send 'lost' event
    if (!this.options.done) {
      this._eventOutput.emit('game:lost');
      this.options.done = true;
    }
  };

  GameController.prototype.quit = function() {
    // Send 'quit' event and reset the model
    this._eventOutput.emit('game:quit');
  };

  GameController.prototype.resume = function() {
    // retrieve game state from the model

    // send 'resume' event
    this._eventOutput.emit('game:resume');
  };

  GameController.prototype.save = function() {
    // save game state to model

    // send 'paused' event
    this._eventOutput.emit('game:saved');
  };

  // ## Private Helpers

  function _reset() {
    this.setOptions({
      destroyed: 0,
      turns: 0,
    });
  }
  
  function _hasWon() {
    var won = false;
    var gametype = this._config.gametype;
    var goal = this._config.goal;

    if (gametype === StageConfig.GAMETYPE_SURVIVAL) {
      if (this.options.turns >= goal) won = true;
    } else if (gametype === StageConfig.GAMETYPE_DESTROY) {
      if (this.options.destroyed >= goal) won = true;
    }

    // console.log(won);
    return won;
  }

  module.exports = GameController;
});