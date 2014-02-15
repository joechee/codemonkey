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

  function ClientPlayer (player) {
    this.player = player;
  }

  ClientPlayer.prototype.moveLeft = function () {
    this.player.move(this.player.x + directions[LEFT][0],
                     this.player.y + directions[LEFT][1]);
  };

  ClientPlayer.prototype.moveRight = function () {

  };

  ClientPlayer.prototype.moveUp = function () {

  };

  ClientPlayer.prototype.moveDown = function () {

  };

  ClientPlayer.prototype.shoot = function (direction) {

  };

  window.ClientPlayer = ClientPlayer;

})(window);
