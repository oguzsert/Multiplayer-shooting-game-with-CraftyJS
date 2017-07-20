var server = require('http').createServer();
var io = require('socket.io')(server);
var extend = require('util')._extend;

var clients = [];

io.on('connection', function (socket) {
	console.log('new connection:', socket.id);
	
	socket.on("createPlayerOnServer", function (data) {
		console.log("createPlayerOnServer", data);
		clients.push({ clientid: socket.id, player: data });
		socket.broadcast.emit("newPlayerJoined", data);
	});

	socket.on("getPlayers", function () {
		socket.emit("currentPlayerList", clients.map(function (c) {
			return c.player;
		}));
	});

	socket.on("ineedcorrections", function () {
		socket.broadcast.emit("sendCorrections");
	});

	socket.on("move-forward", function (data) {
		console.log("move-forward", data);
		socket.broadcast.emit("player-move-forward", data);
	});

	socket.on("move-backward", function (data) {
		console.log("move-backward", data);
		socket.broadcast.emit("player-move-backward", data);
	});

	socket.on("stop-movement", function (data) {
		console.log("stop-movement", data);
		socket.broadcast.emit("player-stop-movement", data);
	});

	socket.on("rotate-right", function (data) {
		console.log("rotate-right", data);
		socket.broadcast.emit("player-rotate-right", data);
	});

	socket.on("rotate-left", function (data) {
		console.log("rotate-left", data);
		socket.broadcast.emit("player-rotate-left", data);
	});

	socket.on("stop-rotate", function (data) {
		console.log("stop-rotate", data);
		socket.broadcast.emit("player-rotate-stop", data);
	});

	socket.on("hurt", function (data) {
		console.log("hurt", data);
		socket.broadcast.emit("player-hurt", data);
	});

	socket.on("die", function (data) {
		console.log("die", data);
		socket.broadcast.emit("player-die", data);
	});

	socket.on("respawn", function (data) {
		console.log("respawn", data);
		socket.broadcast.emit("player-respawn", data);
	});

	socket.on("start-shoot", function (data) {
		console.log("start-shoot", data);
		socket.broadcast.emit("player-start-shoot", data);
	});

	socket.on("stop-shoot", function (data) {
		console.log("stop-shoot", data);
		socket.broadcast.emit("player-stop-shoot", data);
	});

	socket.on("correction", function (data) {
		console.log("correction", data);
		socket.broadcast.emit("player-correction", data);
	});

	socket.on("disconnect", function () {
		console.log("client disconnected", socket.id);

		var clientIndex = -1;
		for (var index = 0; index < clients.length; index++) {
			var c = clients[index];
			if (c.clientid == socket.id) {
				clientIndex = index;
				break;
			}
		}

		if (clientIndex >= 0) {
			console.log("client player removed")
			clients.splice(clientIndex, 1);
		}
	});

});

server.listen(3000);
