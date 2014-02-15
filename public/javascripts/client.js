var Client = function () {
  var arenaCanvas = document.getElementById('arenaCanvas');

  //arenaCanvas.width = window.innerWidth;
  //arenaCanvas.height = window.innerHeight;

  this.readyFunction = undefined;
  this.ready = false;

  var stage = new createjs.Stage(arenaCanvas);

  var game = new Game(stage);
  console.log("Starting Game")

  game.loadMap();
  game.updateWorld();

  registerPlayer('hello', function(player) {
    game.pid = player.id;
    game.player = player;
    game.start();
  });
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
  this.players = {};
  this.projectiles = {};
  this.stage = stage;
  this.timePassed = 0;
  this.state = "LOADING";
  // In seconds
  this.roundTime = 300;
  this.cooldownTime = 5;
  this.score = {};

  this.pid = undefined;
  this.player = undefined;

  this.gameState = new GameState();

  var that = this;
  socket.on('gameState', function(data) {
    that.gameState.unserialize(data);
  });

  // Map
  this.rows = 30; // Math.floor(stage.canvas.height/(GameConfig.tileSize+GameConfig.padding)); 
  this.cols = 40; // Math.floor(stage.canvas.width/(GameConfig.tileSize+GameConfig.padding));
  console.log('Game map started with ',this.rows, this.cols);


  createjs.Ticker.addEventListener('tick', _.bind(this.handleTick, this));
}

Game.prototype.loadMap = function () {
  for (var i=0;i<this.rows;i++) {
    for (var j=0;j<this.cols;j++) {
      var tile = new createjs.Shape();
      tile.graphics.beginFill("#ffcb2d").drawRect(0, 0, GameConfig.tileSize, GameConfig.tileSize);
      //var computedAlpha = Math.abs(i-this.rows)/this.rows;
      //tile.alpha = computedAlpha;
      var pt = xyToPix({x:j,y:i});
      tile.x = pt.x;
      tile.y = pt.y;
      this.stage.addChild(tile);
    }
  }
}

Game.prototype.restart = function () {
  // Clear all players and projectile
  for (var id in this.players) {
    this.players[id].die();
  }
  for (var id in this.projectiles) {
    this.projectiles[id].die();
  }
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
    for (var id in this.players) {
      this.players[id].tick();
    }
    for (var id in this.projectiles) {
      this.projectiles[id].tick();
    }

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
    var chased = this.players[this.pid];
    xy = xyToPix({x:chased.x, y:chased.y});
    var scaleX = 2.0;
    var scaleY = 2.0;
    var leftOffset = this.stage.canvas.width / 2 / scaleX;
    var topOffset = this.stage.canvas.height / 2 / scaleY;

    createjs.Tween.removeTweens(this.stage);
    createjs.Tween.get(this.stage, {override:true})
    .to({ regX : xy.x - leftOffset,
          regY : xy.y - topOffset,
          scaleX: scaleX,
          scaleY: scaleY}, 200, createjs.Ease.linear);

  } else {

    this.stage.scaleX = 1.0;
    this.stage.scaleY = 1.0;
    this.stage.regX = 0;
    this.stage.regY = 0;
  }

  this.stage.update();
}

Game.prototype.updateWorld = function () {
  // Update Players
  for (var id in this.gameState.players) {
    if (!this.players[id]) {
      // These are new player
      this.addPlayer(this.gameState.players[id]);
    } else {
      this.updatePlayer(this.gameState.players[id]);
    }
  }
  for (var id in this.players) {
    if (!this.gameState.players[id]) {
      // These are removed players
      this.removePlayer(this.players[id]);
    }
  }

  // Update Projectile
  for (var id in this.gameState.projectiles) {
    if (!this.projectiles[id]) {
      // These are new player
      this.addProjectile(this.gameState.projectiles[id]);
    } else {
      this.updateProjectile(this.gameState.projectiles[id]);
    }
  }
  for (var id in this.projectiles) {
    if (!this.gameState.projectiles[id]) {
      // These are removed projectiles
      this.removeProjectile(this.projectiles[id]);
    }
  }
}

Game.prototype.addPlayer = function (data) {
  var newPlayer = new Player(data);
  this.players[newPlayer.id] = newPlayer;
  this.stage.addChild(newPlayer.view);
}

Game.prototype.updatePlayer = function (data) {
  var id = data.id;
  this.players[id].x = this.gameState.players[id].x;
  this.players[id].y = this.gameState.players[id].y;
}

Game.prototype.removePlayer = function (player) {
  this.players[player.id] = undefined;
  delete this.players[player.id];
  this.stage.removeChild(player.view);
}

Game.prototype.addProjectile = function (data) {
  var newProjectile = new Projectile(data);
  this.projectiles[newProjectile.id] = newProjectile;
  this.stage.addChild(newProjectile.view);
}

Game.prototype.updateProjectile = function (data) {
  var id = data.id;
  this.projectiles[id].x = this.gameState.projectiles[id].x;
  this.projectiles[id].y = this.gameState.projectiles[id].y;
}

Game.prototype.removeProjectile = function (projectile) {
  this.projectiles[projectile.id] = undefined;
  delete this.projectiles[projectile.id];
  this.stage.removeChild(projectile.view);
}

// ----------
// Player
// ----------

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

// ----------
// Projectile
// ----------


var Projectile = function(data) {
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

Projectile.prototype.tick = function () {
  var xy = xyToPix({x:this.x, y:this.y});
  this.view.x = xy.x;
  this.view.y = xy.y
}

Projectile.prototype.die = function () {
  this.alpha = 0;
}


var SoundManager = {
  sound: []
};

$(document).ready(Client);
