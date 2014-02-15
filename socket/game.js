module.exports = function(gameState, io) {
    var models = require('../models/models.js');
    io.sockets.on('connection', function (socket) {
        var player = new models.Player(gameState);
        socket.player = player;
        onRegisterPlayer(socket);
    });

    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            socket.emit('gameReady', socket.player.serialize());
            broadcastGameStateLoop();
        });

        socket.on('playerMove', function(data) {
            if (socket.player.id == data.playerId) {
                gameState.players[data.playerId].move(data.direction);
            }
        });

        function broadcastGameStateLoop() {
            setTimeout(function broadcastGameState () {
                socket.emit('gameState', gameState.serialize());
                broadcastGameStateLoop();
            }, 1000);
        }
        socket.on('disconnect', function () {
          gameState.deregisterPlayer(socket.player);
        });
    }
};
