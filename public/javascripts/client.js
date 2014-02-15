var Client = function () {
  var arenaCanvas = document.getElementById('arenaCanvas');

  //arenaCanvas.width = window.innerWidth;
  //arenaCanvas.height = window.innerHeight;

  var stage = new createjs.Stage(arenaCanvas);

  var game = new Game(stage);
  console.log("Starting Game")

  game.loadMap();
  game.start();
  console.log("Loaded Game")
};


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
  this.rows = 40;
  this.cols = 30;
  this.tileSize = 20;
  this.padding = 2;

  createjs.Ticker.addEventListener('tick', _.bind(this.handleTick, this));
}

Game.prototype.loadMap = function () {
  for (var i=0;i<this.rows;i++) {
    for (var j=0;j<this.cols;j++) {
      var tile = new createjs.Shape();
      tile.graphics.beginFill("#ffcb2d").drawRect(0, 0, this.tileSize, this.tileSize);
      var computedAlpha = Math.abs(i-this.rows)/this.rows;
      tile.alpha = computedAlpha;

      tile.x = i * (this.tileSize + this.padding);
      tile.y = j * (this.tileSize + this.padding);
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

  //console.log("Update stage")
  if (this.stage.mouseInBounds) {
    this.stage.scaleX = 2.0;
    this.stage.scaleY = 2.0;
    this.stage.regX = this.stage.mouseX;
    this.stage.regY = this.stage.mouseY;
  } else {
    this.stage.scaleX = 1.0;
    this.stage.scaleY = 1.0;
    this.stage.regX = 0;
    this.stage.regY = 0;
  }
  this.stage.update();
  //console.log("mouse: ",this.stage.mouseX, this.stage.mouseY);
  //console.log("stage: ",this.stage.regX, this.stage.regY);
}

Game.prototype.updateWorld = function () {
  // Socket code to retrieve players and projectile positions
  
  // Add New Player objects
  
  // Update Existing Players
}

Game.prototype.addPlayer = function (data) {
  var newPlayer = new Player(data);
  this.stage.addChild(newPlayer.view);
}

Game.prototype.removePlayer = function (player) {
  this.players = _.filter(this.players, function(p) {return p.id != player.id;});
  this.stage.removeChild(player.view);
}

var Player = function(data) {
  this.id = data.id;
  this.name = data.name;

  // Easeljs stuff
  this.view = new createjs.Shape();
  this.view.graphics.beginFill("#ff0000").drawRect(0, 0, 100, 100);

  this.view.x = data.x;
  this.view.y = data.y;

  this.x = data.x;
  this.y = data.y;

  this.view.alpha = 0;
}

Player.prototype.tick = function () {
  this.view.x = this.x;
  this.view.y = this.y;
}

Player.prototype.die = function () {
  this.alpha = 0;
}


var SoundManager = {
  sound: []
};

$(document).ready(Client);
