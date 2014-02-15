(function(window) {
    var UP = 0;
    var RIGHT = 1;
    var LEFT = 2;
    var DOWN = 3;
    var DIRECTIONS = [
    [0,-1],
    [1,0],
    [0,1],
    [-1,0]
    ];

    function PlayerCommands(socket, player) {
        this.socket = socket;
        this.player = player;
    }

    function makeMove(id, direction) {
        return function() {
            socket.emit('playerMove', {playerId: id, direction: direction});
        }
    }

    PlayerCommands.prototype.moveLeft = makeMove(this.player.id, LEFT);
    PlayerCommands.prototype.moveRight = makeMove(this.player.id, RIGHT);
    PlayerCommands.prototype.moveUp = makeMove(this.player.id, UP);
    PlayerCommands.prototype.moveDown = makeMove(this.player.id, DOWN);

    window.PlayerCommands = PlayerCommands;
})(window);