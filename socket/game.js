module.exports = function(PlayerModel, gameState, io) {
    io.sockets.on('connection', function (socket) {
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
    }
};
