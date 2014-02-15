var socket = io.connect('http://localhost');

var gameState = new GameState();

function registerPlayer(name) {
    socket.emit('registerPlayer', {name: name});
}

var test = 0;
socket.on('gameState', function (data) {
  gameState.unserialize(data); 
  if (!test) {
    console.log(gameState);
  }
  test = 1;
});
