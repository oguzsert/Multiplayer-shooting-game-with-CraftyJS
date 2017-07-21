var server = require('http').createServer();
var io = require('socket.io')(server);
var extend = require('util')._extend;

var clients = [];

var points = {
	hurt: 1,
	kill: 10,
	dead: 0
}

io.on('connection', function (socket) {

	console.log('new connection:', socket.id);

	socket.on("createPlayerOnServer", function (data) {
		console.log("createPlayerOnServer", data);


		var newClient = { clientid: socket.id, player: data }

		newClient.player.score = {
			kill: 0,
			dead: 0,
			points: 0
		};

		clients.push(newClient);

		io.sockets.emit('scoreboard-update', clients);

		socket.broadcast.emit("newPlayerJoined", data);
	});

	socket.on("getPlayers", function () {
		socket.emit("currentPlayerList", clients.map(function (c) {
			return c.player;
		}));
		io.sockets.emit('scoreboard-update', clients);
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

		if (updatePlayerScore(data.hitterId, "points", points.hurt)) {
			io.sockets.emit('scoreboard-update', clients);
		}
	});

	socket.on("die", function (data) {
		console.log("die", data);
		socket.broadcast.emit("player-die", data);

		updatePlayerScore(data.hitterId, "points", points.kill);
		updatePlayerScore(data.hitterId, "kill", 1);
		if (updatePlayerScore(data.playerId, "dead", 1)) {
			io.sockets.emit('scoreboard-update', clients);
		}
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

		var c = removeClient(socket.id);

		io.sockets.emit('scoreboard-update', clients);
	});

	function updatePlayerScore(playerId, parameter, value) {

		var targetPlayer = getPlayerById(playerId);

		if (!targetPlayer) return false;

		if (!targetPlayer.score) {
			targetPlayer.score = {
				kill: 0,
				dead: 0,
				points: 0
			};
		}

		targetPlayer.score[parameter] += value;

		return true;
	}

	function getPlayerBySocketId(socketId) {
		var clientIndex = -1;
		for (var index = 0; index < clients.length; index++) {
			var c = clients[index];
			if (c.clientid == socketId) {
				return c.player;
			}
		}
		return null;
	}

	function getPlayerById(playerId) {
		var clientIndex = -1;
		for (var index = 0; index < clients.length; index++) {
			var c = clients[index];
			if (c.player.playerid == playerId) {
				return c.player;
			}
		}
		return null;
	}

	function getClientIndex(socketId) {
		var clientIndex = -1;
		for (var index = 0; index < clients.length; index++) {
			var c = clients[index];
			if (c.clientid == socketId) {
				return index;
			}
		}
		return -1;
	}

	function removeClient(clientId) {
		var clientIndex = getClientIndex(clientId);

		if (clientIndex >= 0) {
			
			var player = getPlayerBySocketId(clientId);

			if (player) {
				console.log("player-left", player);
				io.sockets.emit('playerLeft', player);
			}

			console.log("client removed")
			clients.splice(clientIndex, 1);

			return clients[clientIndex]
		}

		return null;
	}
});

server.listen(3000);
