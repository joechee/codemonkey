module.exports = function(gameState, io) {
    var models = require('../models/models.js');
    io.sockets.on('connection', function (socket) {
        var player = new models.Player(gameState);
        socket.player = player;
        onRegisterPlayer(socket);
    });

    var lastEmitTime = 0;
    function floodCheck() {
        var time = new Date().getTime();

        if (time - lastEmitTime < 100) {
            return false;
        }

        lastEmitTime = time;
        return true;
    }

    function broadcastGameState() {
        io.sockets.emit('gameState', gameState.serialize());
    }

    gameState.broadcastGameState = broadcastGameState;

    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            socket.player.name = data.name;
            socket.emit('gameReady', socket.player.serialize());
            broadcastGameState();
        });

        socket.on('left', function(data) {
            if (socket.player.id == data.playerId) {
                if (floodCheck()) {
                    var player = gameState.players[data.playerId];
                    player.rotateLeft();
                    broadcastGameState();
                }
            }
        });

        socket.on('right', function(data) {
            if (socket.player.id == data.playerId) {
                if (floodCheck()) {
                    var player = gameState.players[data.playerId];
                    player.rotateRight();
                    broadcastGameState();
                }
            }
        });

        socket.on('shoot', function(data) {
            if (socket.player.id == data.playerId) {
                if (floodCheck()) {
                    var player = gameState.players[data.playerId];
                    player.shoot(player.direction);
                    if (Object.keys(gameState.projectiles).length == 1) {
                        gameState.updateProjectiles(broadcastGameState);
                    }
                }
            }
        });

        socket.on('move', function(data) {
            if (socket.player.id == data.playerId) {
                if (floodCheck()) {
                    var player = gameState.players[data.playerId];
                    player.move(player.direction);
                    broadcastGameState();
                }
            }
        });

        socket.on('disconnect', function () {
          gameState.deregisterPlayer(socket.player);
          broadcastGameState();
        });
    }
};
