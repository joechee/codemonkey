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

    var queue = [];
    var queueEmpty = true;
    function send(key, command) {
        command.key = key;
        queue.push(command);
        if (queueEmpty) {
            processQueue();
            queueEmpty = false;
        }
    }

    function processQueue() {
        if (queue.length == 0) {
            queueEmpty = true;
            return;
        }

        var top = queue[0];
        socket.emit(top.key, top);
        queue.splice(0, 1);
        setTimeout(processQueue, 200);
    }

    // Empties the queue. Untested
    function emptyQueue() {
        queue = [];
    }

    function PlayerCommands(socket, player) {
        this.socket = socket;
        this.player = player;
    }

    function makeCmd(cmd, direction) {
        return function() {
            send(cmd, {playerId: this.player.id, direction: direction})
        }
    }

    PlayerCommands.prototype.left = makeCmd('playerMove', LEFT);
    PlayerCommands.prototype.right = makeCmd('playerMove', RIGHT);
    PlayerCommands.prototype.up = makeCmd('playerMove', UP);
    PlayerCommands.prototype.down = makeCmd('playerMove', DOWN);
    PlayerCommands.prototype.shootLeft = makeCmd('playerShoot', LEFT);
    PlayerCommands.prototype.shootRight = makeCmd('playerShoot', RIGHT);
    PlayerCommands.prototype.shootUp = makeCmd('playerShoot', UP);
    PlayerCommands.prototype.shootDown = makeCmd('playerShoot', DOWN);

    window.PlayerCommands = PlayerCommands;
})(window);
