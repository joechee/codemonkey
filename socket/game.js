module.exports = function(gameState, io) {
    var models = require('../models/models.js');
    io.sockets.on('connection', function (socket) {
        var player = new models.Player(gameState);
        socket.player = player;
        onRegisterPlayer(socket);
    });

    function broadcastGameState(socket) {
        socket.emit('gameState', gameState.serialize());
    }

    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            socket.emit('gameReady', socket.player.serialize());
            broadcastGameState(socket);
        });

        socket.on('playerMove', function(data) {
            if (socket.player.id == data.playerId) {
                gameState.players[data.playerId].move(data.direction);
                broadcastGameState(socket);
            }
        });

        socket.on('disconnect', function () {
          gameState.deregisterPlayer(socket.player);
        });
    }
};
