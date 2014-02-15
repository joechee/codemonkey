var socket = io.connect('http://localhost');


function registerPlayer(name, callback) {
    socket.emit('registerPlayer', {name: name});
    socket.on('gameReady', function(data) {
        if (callback) {
            callback(data);
        }
    });
}