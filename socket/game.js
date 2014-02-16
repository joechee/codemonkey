module.exports = function(gameState, io) {
    var models = require('../models/models.js');
    var zlib = require('zlib');

    io.sockets.on('connection', function (socket) {
        socket.lastEmitTime = new Date();
        var player = new models.Player(gameState);
        socket.player = player;
        onRegisterPlayer(socket);
    });
    var lastEmitTime = 0;
    function floodCheck(socket) {

        var time = new Date().getTime();

        if (time - socket.lastEmitTime < 100) {
            return false;
        }

        socket.lastEmitTime = time;
        return true;
    }

/*
    var throttle = new Date();

    function broadcastGameState(force) {
        if (new Date() - throttle > 33.3 || force) { // Essentially to create at least 30 fps
            io.sockets.emit('gameState', gameState.serialize());
            throttle = new Date();
        } else {
            return;
        }
*/
    var throttle = new Date();

    function broadcastGameState(force) {
        var state = gameState.serialize();
        var buffer = JSON.stringify(state);

        if (new Date() - throttle > 33.3 || force) {// Essentially to create at least 30 fps
            throttle = new Date();
        } else {
            return;
        }

        zlib.gzip(buffer, function(err, buffer) {
            if (err) {
                console.log(err);
            }
            io.sockets.emit('gameState', buffer.toString('base64'));
        });
    }

    gameState.broadcastGameState = broadcastGameState;

    function onRegisterPlayer(socket) {
        socket.on('registerPlayer', function(data) {
            socket.player.name = data.name;
            socket.emit('gameReady', socket.player.serialize());
            broadcastGameState(true);
        });

        socket.on('playerMove', function(data) {
            if (!floodCheck(socket)) {
                return;
            }
            if (socket.player.id == data.playerId) {
                gameState.players[data.playerId].move(data.direction);
                broadcastGameState();
            }
        });

        socket.on('playerShoot', function(data) {
            if (!floodCheck(socket)) { return; }
            if (socket.player.id == data.playerId) {
                var projectile = gameState.players[data.playerId].shoot(data.direction);
                if (Object.keys(gameState.projectiles).length == 1) {
                    gameState.updateProjectiles(broadcastGameState);
                }
            }
        });

        socket.on('disconnect', function () {
          gameState.deregisterPlayer(socket.player);
          broadcastGameState();
        });
    }
};
