(function(window) {
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

    PlayerCommands.prototype.left = function() {
        send('left', {playerId: this.player.id});
    }

    PlayerCommands.prototype.right = function() {
        send('right', {playerId: this.player.id});
    }

    PlayerCommands.prototype.move = function() {
        send('move', {playerId: this.player.id});
    }

    PlayerCommands.prototype.shoot = function() {
        send('shoot', {playerId: this.player.id});
    }

    PlayerCommands.prototype.stop = function() {
        emptyQueue();
    }

    window.PlayerCommands = PlayerCommands;
})(window);
