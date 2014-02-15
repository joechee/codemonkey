module.exports = function(io) {
    io.sockets.on('connection', function (socket) {
        socket.on('registerPlayer', function(data) {
            console.log(data);
        });
    });
};
