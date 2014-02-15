module.exports = function(gameEngine, io) {
    io.sockets.on('connection', function (socket) {
        onRegisterPlayer(socket);
    });


    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            console.log(data);
        });
    }
};
