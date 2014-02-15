var socket = io.connect('http://' + window.location.host);


function registerPlayer(name, callback) {
    socket.emit('registerPlayer', {name: name});
    socket.on('gameReady', function(data) {
        if (callback) {
            callback(socket, data);
        }
    });
}