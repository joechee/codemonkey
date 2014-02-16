(function(window) {
    var UP = 0;
    var LEFT = 1;
    var DOWN = 2;
    var RIGHT = 3;

    var directions = [
        [0, -1],
        [-1, 0],
        [0, 1],
        [1, 0]
    ];

    var queue = [];
    var queueEmpty = true;
    function send(key, command) {
        // Only enqueue up to 50 commands, 
        // drop the packets
        if (queue.length < 50) {
            command.key = key;
            queue.push(command);
            if (queueEmpty) {
                processQueue();
                queueEmpty = false;
            }
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
        var fn = function() {
            send(cmd, {playerId: this.player.id, direction: direction});
            return this;
        };
        fn.toString = function () {
            return "[Function function]";
        };
        return fn;

    }


    PlayerCommands.prototype.left = makeCmd('playerMove', LEFT);
    PlayerCommands.prototype.right = makeCmd('playerMove', RIGHT);
    PlayerCommands.prototype.up = makeCmd('playerMove', UP);
    PlayerCommands.prototype.down = makeCmd('playerMove', DOWN);
    PlayerCommands.prototype.shootLeft = makeCmd('playerShoot', LEFT);
    PlayerCommands.prototype.shootRight = makeCmd('playerShoot', RIGHT);
    PlayerCommands.prototype.shootUp = makeCmd('playerShoot', UP);
    PlayerCommands.prototype.shootDown = makeCmd('playerShoot', DOWN);
    PlayerCommands.prototype.stop = function() {
        emptyQueue();
        return this;
    };
    PlayerCommands.prototype.stop.toString = function () {
        return "[Function function]";
    };
    PlayerCommands.prototype.shoot = makeCmd('playerShoot', -1);

    PlayerCommands.prototype.toString = function () {
        return "[Object Me]";
    };

    window.PlayerCommands = PlayerCommands;
})(window);
