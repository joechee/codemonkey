var socket = io.connect('http://localhost');

function registerPlayer(name) {
    socket.emit('registerPlayer', {name: name});
}
