var socket = io.connect('http://localhost');

function registerPlayer(name) {
    socket.emit('registerPlayer', {name: name});
}

socket.on('message', function(data) {
    console.log(data);
});