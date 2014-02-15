module.exports = function(gameEngine, io) {
    var models = require('../models/models.js');
    io.sockets.on('connection', function (socket) {
        var player = new models.Player(gameEngine);
        socket.player = player;
        onRegisterPlayer(socket);

        socket.on('players', function(data) {
            console.log('here');
            socket.emit('message', gameState.players);
        })
    });

    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            var player = new PlayerModel(0, 0, 1);
            gameState.registerPlayer(player);
        });
        function broadcastGameStateLoop() {
            setTimeout(function broadcastGameState () {
                socket.emit('gameState', gameEngine.serialize());
                broadcastGameStateLoop();
            }, 1000);
        }
        socket.on('disconnect', function () {
          gameEngine.deregisterPlayer(socket.player);
        });
        broadcastGameStateLoop();
    }
};
