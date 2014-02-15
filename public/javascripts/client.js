var Client = function () {
  var arenaCanvas = document.getElementById('arenaCanvas');

  //arenaCanvas.width = window.innerWidth;
  //arenaCanvas.height = window.innerHeight;

  var stage = new createjs.Stage(arenaCanvas);

  var game = new Game(stage);
  console.log("Starting Game")

  game.loadMap();

  // ===== Add Player Test code here
  var p = {
    id: 1234,
    name: 'test',
    HP: 3,
    direction: 0, // 0 - Up, 1 - Right, 2 - Down, 3 - Left
    x: 20,
    y: 20 
  };

  game.addPlayer(p);
  // =====

  game.start();
  console.log("Loaded Game")
};

GameConfig = {
  tileSize: 20,
  padding: 2,
  playerSize: 18,
  doChaseCam: true
};

var xyToPix = function(pt) {
  return {x:pt.x*(GameConfig.tileSize+GameConfig.padding),y:pt.y*(GameConfig.tileSize+GameConfig.padding)}
}

var Game = function (stage) {
  this.players = [];
  this.projectiles = [];
  this.stage = stage;
  this.timePassed = 0;
  this.state = "LOADING";
  // In seconds
  this.roundTime = 300;
  this.cooldownTime = 5;
  this.score = {};

  // Map
  this.rows = Math.floor(stage.canvas.height/(GameConfig.tileSize+GameConfig.padding)); //40;
  this.cols = Math.floor(stage.canvas.width/(GameConfig.tileSize+GameConfig.padding)); //30;
  console.log('Game map started with ',this.rows, this.cols);

  createjs.Ticker.addEventListener('tick', _.bind(this.handleTick, this));
}

Game.prototype.loadMap = function () {
  for (var i=0;i<this.rows;i++) {
    for (var j=0;j<this.cols;j++) {
      var tile = new createjs.Shape();
      tile.graphics.beginFill("#ffcb2d").drawRect(0, 0, GameConfig.tileSize, GameConfig.tileSize);
      var computedAlpha = Math.abs(i-this.rows)/this.rows;
      tile.alpha = computedAlpha;
      var pt = xyToPix({x:j,y:i});
      tile.x = pt.x;
      tile.y = pt.y;
      this.stage.addChild(tile);
    }
  }
}

Game.prototype.restart = function () {
  // Clear all players and projectile
  this.players.map(function (p) { p.die() });
  this.projectiles.map(function (p) { p.die() });
}


Game.prototype.start = function() {
  createjs.Ticker.setPaused(false);
  this.state = "PLAYING";
}

Game.prototype.handleTick = function(ticker_data) {
  if (this.state === "LOADING") return;
  var timestep = Math.min(ticker_data.delta, 34) / 1000.0;
  this.updateWorld();

  if (this.state === "PLAYING") {
    this.players.map(function (p) {p.tick();});
    this.projectiles.map(function(p){p.tick();});

    this.timePassed += timestep;
    if (this.timePassed >= this.roundTime) { this.end(); }
  }

  if (this.state == "END") {
    if (this.gameEndEffect) {
      this.gameEndEffect.tick(timestep);
    }
  }
  
  // Chase Cam - Currently hardcoded to chase Player id:1234
  if (GameConfig.doChaseCam) {
    this.stage.scaleX = 1.0;
    this.stage.scaleY = 1.0;
    var chased = _.find(this.players, function(p){return p.id == 1234;});
    xy = xyToPix({x:chased.x, y:chased.y});
    var leftOffset = this.stage.canvas.width / 2;
    var topOffset = this.stage.canvas.height / 2;

    this.stage.regX = xy.x - leftOffset;
    this.stage.regY = xy.y - topOffset;

  } else {

    this.stage.scaleX = 1.0;
    this.stage.scaleY = 1.0;
    this.stage.regX = 0;
    this.stage.regY = 0;
  }

  this.stage.update();
}

Game.prototype.updateWorld = function () {
  // Socket code to retrieve players and projectile positions
  
  // Add New Player objects
  
  // Update Existing Players
}

Game.prototype.addPlayer = function (data) {
  var newPlayer = new Player(data);
  this.players.push(newPlayer);
  this.stage.addChild(newPlayer.view);
}

Game.prototype.removePlayer = function (player) {
  this.players = _.filter(this.players, function(p) {return p.id != player.id;});
  this.stage.removeChild(player.view);
}

var Player = function(data) {
  this.data = data;
  this.id = data.id;
  this.name = data.name;

  // Easeljs stuff
  this.view = new createjs.Shape();
  var leftPadding = Math.abs(GameConfig.tileSize - GameConfig.playerSize) / 2;
  this.view.graphics.beginFill("#00ff00").drawRect(leftPadding, leftPadding, GameConfig.playerSize, GameConfig.playerSize);

  var xy = xyToPix(data);
  this.view.x = xy.x;
  this.view.y = xy.y

  this.x = data.x;
  this.y = data.y;

  this.view.alpha = 1;
}

Player.prototype.tick = function () {
  var xy = xyToPix({x:this.x, y:this.y});
  this.view.x = xy.x;
  this.view.y = xy.y
}

Player.prototype.die = function () {
  this.alpha = 0;
}


var SoundManager = {
  sound: []
};

$(document).ready(Client);
