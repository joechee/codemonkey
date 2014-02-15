var Client = function () {
  var arenaCanvas = document.getElementById('arena-canvas');

  //arenaCanvas.width = window.innerWidth;
  //arenaCanvas.height = window.innerHeight;

  this.readyFunction = undefined;
  this.ready = false;

  var stage = new createjs.Stage(arenaCanvas);

  game = new Game(stage);
  console.log("Starting Game")

  game.loadMap();
  game.updateWorld();

  registerPlayer(PLAYER_NAME, function(socket, player) {
    console.log(player);
    game.pid = player.id;
    game.player = player;
    game.start();
    console.log("Game Started");
    document.playerCommands = new PlayerCommands(socket, player);
  });
};

GameConfig = {
  tileSize: 25,
  padding: 1,
  playerSize: 18,
  chaseZoom: 1.0,
  doChaseCam: false,
  rows: 23,
  cols: 29
};

var xyToPix = function(pt) {
  return {x:pt.x*(GameConfig.tileSize+GameConfig.padding),y:pt.y*(GameConfig.tileSize+GameConfig.padding)}
}

var xyToCenterPix = function(pt) {
  return {
    x:pt.x*(GameConfig.tileSize+GameConfig.padding)+GameConfig.tileSize/2,
    y:pt.y*(GameConfig.tileSize+GameConfig.padding)+GameConfig.tileSize/2
  }
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
  this.rows = GameConfig.rows; //Math.floor(stage.canvas.height/(GameConfig.tileSize+GameConfig.padding)); 
  this.cols = GameConfig.cols; //Math.floor(stage.canvas.width/(GameConfig.tileSize+GameConfig.padding));
  console.log('Game map started with ',this.rows, this.cols);


  createjs.Ticker.addEventListener('tick', _.bind(this.handleTick, this));
}

Game.prototype.loadMap = function () {
  for (var i=0;i<this.rows;i++) {
    for (var j=0;j<this.cols;j++) {
      var tile = new createjs.Shape();
      tile.graphics.beginFill("rgba(164, 123, 0, 0.8)").drawRect(0, 0, GameConfig.tileSize, GameConfig.tileSize);
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
    var scaleX = GameConfig.chaseZoom;
    var scaleY = GameConfig.chaseZoom;
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
      if (this.players[id].HP > this.gameState.players[id].HP) {
        this.players[id].animateHit(this.stage);
      }
      var lastRotation = this.players[id].view.rotation;
      if (this.gameState.players[id].x < this.players[id].x) {
        // Move left
        this.updatePlayer(this.gameState.players[id], -90);
      } else if (this.gameState.players[id].x > this.players[id].x) {
        // Move right
        this.updatePlayer(this.gameState.players[id], 90);
      } else if (this.gameState.players[id].y > this.players[id].y) {
        // Move down
        this.updatePlayer(this.gameState.players[id], 180);
      } else if (this.gameState.players[id].y < this.players[id].y) {
        // Move Up
        this.updatePlayer(this.gameState.players[id], 0);
      } else {
        //this.updatePlayer(this.gameState.players[id]. lastRotation);
      }
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
      // These are new projectiles
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
  this.stage.addChild(newPlayer.nameView);
}

Game.prototype.updatePlayer = function (data, rotation) {
  console.log('updatePlayer');
  var id = data.id;
  this.players[id].x = this.gameState.players[id].x;
  this.players[id].y = this.gameState.players[id].y;
  this.players[id].HP = this.gameState.players[id].HP;
  this.players[id].view.rotation = rotation;
}

Game.prototype.removePlayer = function (player) {
  this.stage.removeChild(player.nameView);
  delete this.players[player.id].nameView;
  this.players[player.id].nameView = undefined;

  this.stage.removeChild(player.view);
  delete this.players[player.id].view;
  this.players[player.id].view = undefined;
  this.players[player.id] = undefined;
  delete this.players[player.id];
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
  this.stage.removeChild(projectile.view);
  delete this.projectiles[projectile.id].view;
  this.projectiles[projectile.id].view = undefined;
  this.projectiles[projectile.id] = undefined;
  delete this.projectiles[projectile.id];
}

// ----------
// Player
// ----------

var Player = function(data) {
  this.data = data;
  this.id = data.id;
  this.name = data.name;

  // Easeljs stuff
  this.view = new createjs.Bitmap('/images/monkey.png');
  var scale = GameConfig.tileSize / 100;

  this.view.scaleX = scale * 1.5;
  this.view.scaleY = scale * 1.5;

  this.view.regY = 100 / 2;
  this.view.regX = 100 / 2;

  var xy = xyToCenterPix(data);
  this.view.x = xy.x;
  this.view.y = xy.y

  this.x = data.x;
  this.y = data.y;
  this.HP = data.HP;

  this.nameView = new createjs.Text(this.name, "12px 'peachy-keen'", "");
  this.nameView.textAlign = 'center';
  this.nameView.x = xy.x;
  this.nameView.y = xy.y + GameConfig.tileSize/2;

  this.view.alpha = 1;
}

Player.prototype.tick = function () {
  var xy = xyToCenterPix({x:this.x, y:this.y});
  this.view.x = xy.x;
  this.view.y = xy.y

  this.nameView.x = xy.x;
  this.nameView.y = xy.y + GameConfig.tileSize/2;
}

Player.prototype.animateHit = function (stage) {
  // Blood
  var x = this.view.x;
  var y = this.view.y;

  for (var i=0; i<100; i++) {
    var splat = new createjs.Shape();
    var splatSize = GameConfig.playerSize * 0.5 * Math.random();
    //splat.graphics.beginFill("#ff0000").drawRect(0, 0, splatSize, splatSize);
    splat.graphics.beginFill("#ff0000").drawCircle(0,0,splatSize);
    splat.x = x;
    splat.y = y;
    var offsetX = 30 * (Math.random() * 2.0 - 1);
    var offsetY = 30 * (Math.random() * 2.0 - 1);

    createjs.Tween.get(splat).to({x:x+offsetX, y:y+offsetY, alpha:0}, 500);
    stage.addChild(splat);
    setTimeout(function(){stage.removeChild(splat);delete splat;},520);
  }
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

  // Easeljs stuff
  // this.view = new createjs.Shape();
  this.view = new createjs.Bitmap('/images/banana.png');
  var scaleX = GameConfig.tileSize / 300;
  var scaleY = GameConfig.tileSize / 218;

  this.view.scaleX = scaleX;
  this.view.scaleY = scaleY;

  this.view.regX = scaleX * 300;
  this.view.regY = scaleY * 218;

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
  this.view.y = xy.y;

  //this.view.rotation += 5;
}

Projectile.prototype.die = function () {
  this.alpha = 0;
}


var SoundManager = {
  sound: []
};

$(document).ready(Client);
