(function (window) {

  var UP = 0;
  var RIGHT = 1;
  var LEFT = 2;
  var DOWN = 3;
  var directions = [
    "0,-1",
    "1,0",
    "0,1",
    "-1,0"
  ];

  function IDGenerator() {
    this.currentID = 0;
  }

  
  IDGenerator.prototype.generate = function () {
    return this.currentID++;
  };
  
  var idgen = new IDGenerator();
    

  function GameState () {
    this.players = [];
    this.projectiles = [];
  }

  GameState.prototype.registerPlayer = function (player) {
    this.players.add(player);
    player.gameState = gameState;
  };

  GameState.prototype.registerProjectile = function (projectile) {
    this.projectiles[projectile.id] = projectile;
  };

  GameState.prototype.registerProjectile = function (projectile) {
    delete this.projectiles[projectile.id];
  };
  
  function Player(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.HP = 3;
    this.type = "player";
  }

  Player.prototype.move = function (x, y) {
    if (this.gameState === undefined) {
      throw new Error("Game State not defined!");
    }
    if (this.checkCollision()) {
      return false;
    }

    var oldX = this.x;
    var oldY = this.y;
    
    var changeX = this.x - x;
    var changeY = this.y - y;

    this.direction = directions.indexOf([changeX, changeY].toString()); 
    if (this.direction === -1) {
      throw new Error("Direction is borked!");
    }
    
    this.x = x;
    this.y = y;
    return true;
  };

  // Returns true if there is a collision
  Player.prototype.checkCollision = function () {
    for (var i = 0; i < this.gameState.players.length; i++) {
      if (this.gameState.players[i].x === x || 
          this.gameState.players[i].y === y) {
        return true;
      }
    }
    return false;
  };


  Player.prototype.shoot = function (direction) {
    var projectile = new Projectile(this.gameState,
                                    x + directions[direction][0],
                                    y + directions[direction][1],
                                    direction
                                    this);
  };

  function Projectile(gameState, x, y, direction, owner) {
    if (!gameState || !x || !y || !direction || !owner) {
      throw new Error("Undefined argments passed into Projectile constructor!");
    }
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.owner = owner;
    this.id = idgen.generate(); // Not too sure if this is necessary
    gameState.registerProjectile(this);
  }

  Projectile.updateState = function () {
    var oldX = this.x;
    var oldY = this.y;
    this.x = oldX + directions[this.direction][0];
    this.y = oldY + directions[this.direction][1];

    var playerCollision = this.checkCollision();
    if (playerCollision) {
      playerCollision.HP--;
      gameState.deregisterProjectile(this);
    }
  };

  Projectile.checkCollision = function () {
    for (var i = 0; i < this.gameState.players.length; i++) {
      if (this.gameState.players[i].x === x || 
          this.gameState.players[i].y === y) {
        return this.gameState.players[i];
      }
    }
    return false;
  };

  window.Player = Player;
  window.Projectile = Projectile;
  window.GameState = GameState;
})(module && module.exports || window);
