/* globals define */

/**
 * GameView contains all the gameplay views, i.e. GameHeaderView and BoardView
 */
define(function(require, exports, module) {
  var View          = require('famous/core/View');
  var Surface       = require('famous/core/Surface');
  var Transform     = require('famous/core/Transform');
  var StateModifier = require('famous/modifiers/StateModifier');

  // ## Views
  var BoardView = require('./BoardView');

  function _createBoardView() {
    this.boardView = new BoardView();
    this.boardModifier = new StateModifier();

    this.add(this.boardModifier).add(this.boardView);
  }

  function GameView() {
    View.apply(this, arguments);

    _createBoardView.call(this);
  }

  GameView.prototype = Object.create(View.prototype);
  GameView.prototype.constructor = GameView;

  GameView.DEFAULT_OPTIONS = {};

  module.exports = GameView;
});
