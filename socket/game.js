module.exports = function(gameState, io) {
    var models = require('../models/models.js');
    io.sockets.on('connection', function (socket) {
        var player = new models.Player(gameState);
        socket.player = player;
        onRegisterPlayer(socket);

        socket.on('players', function(data) {
            console.log('here');
            socket.emit('message', gameState.players);
        })
    });

    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            var player = new models.Player(gameState);
            gameState.registerPlayer(player);

            socket.emit('gameReady', player.serialize());
            broadcastGameStateLoop();
        });

        socket.on('playerMove', function(data) {
            if (socket.player.id == data.playerId) {
                gameState.players[data.playerId].move(data.x, data.y);
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
