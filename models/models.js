(function (window) {

  var UP = 0;
  var RIGHT = 1;
  var LEFT = 2;
  var DOWN = 3;

  function GameState () {
    this.players = [];
    this.projectiles = [];
  }

  GameState.prototype.registerPlayer = function (player) {
    this.players.add(player);
    player.gameState = gameState;
  };

  function Player(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.HP = 100;
    this.type = "player";
  }

  Player.prototype.move = function (x, y) {
    if (this.gameState === undefined) {
      throw new Error("Game State not defined!");
    }
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].x === x || this.players[i].y === y) {
        return false;
      }
    }

    var oldX = this.x;
    var oldY = this.y;
    
    var changeX = this.x - x;
    var changeY = this.y - y;

    var directions = [
      "0,-1",
      "1,0",
      "0,1",
      "-1,0"
    ];
    
    this.direction = directions.indexOf([changeX, changeY].toString()); 
    if (this.direction === -1) {
      throw new Error("Direction is borked!");
    }
    
    this.x = x;
    this.y = y;
    return true;
  };


  Player.prototype.

  function Projectile() {
  }

  window.Player = Player;
  window.Projectile = Projectile;
})(module && module.exports || window);
