var socket = io.connect(window.location);


function registerPlayer(name, callback) {
    socket.emit('registerPlayer', {name: name});
    socket.on('gameReady', function(data) {
        if (callback) {
            callback(socket, data);
        }
    });
}