(function(window) {
    var UP = 0;
    var RIGHT = 1;
    var LEFT = 2;
    var DOWN = 3;
    var DIRECTIONS = [
    [0,-1],
    [1,0],
    [-1,0],
    [0,1]
    ];

    function PlayerCommands(socket, player) {
        this.socket = socket;
        this.player = player;
    }

    function makeMove(direction) {
        return function() {
            socket.emit('playerMove', {playerId: this.player.id, direction: direction});
        }
    }

    PlayerCommands.prototype.left = makeMove(LEFT);
    PlayerCommands.prototype.right = makeMove(RIGHT);
    PlayerCommands.prototype.up = makeMove(UP);
    PlayerCommands.prototype.down = makeMove(DOWN);

    window.PlayerCommands = PlayerCommands;
})(window);