module.exports = function(gameEngine, io) {
    var models = require('../models/models.js');
    io.sockets.on('connection', function (socket) {
        var player = new models.Player(gameEngine);
        socket.player = player;
        onRegisterPlayer(socket);
    });

    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            console.log(data);
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
