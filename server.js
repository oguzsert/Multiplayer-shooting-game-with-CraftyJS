var server = require('http').createServer();
var io = require('socket.io')(server);



io.on('connection', function (client) {

	client.on("createPlayerOnServer", function (player) {
		console.log("createPlayerOnServer", player);
		client.broadcast.emit("newPlayerJoined", player);
	});

	client.on("engine-on", function (player) {
		console.log("engine-on", player);
		client.broadcast.emit("player-engine-on", player);
	});

	client.on("engine-off", function (player) {
		console.log("engine-off", player);
		client.broadcast.emit("player-engine-off", player);
	});

	client.on("move-forward", function (player) {
		console.log("move-forward", player);
		client.broadcast.emit("player-move-forward", player);
	});

	client.on("move-backward", function (player) {
		console.log("move-backward", player);
		client.broadcast.emit("player-move-backward", player);
	});

	client.on("stop-movement", function (player) {
		console.log("stop-movement", player);
		client.broadcast.emit("player-stop-movement", player);
	});

	client.on("rotate-right", function (playerInfo) {
		client.broadcast.emit("player-rotate-right", playerInfo);
	});

	client.on("rotate-left", function (playerInfo) {
		client.broadcast.emit("player-rotate-left", playerInfo);
	});

	client.on("stop-rotate", function (playerInfo) {
		client.broadcast.emit("player-rotate-stop", playerInfo);
	});

	client.on("shoot", function (playerInfo) {
		client.broadcast.emit("player-shoot", playerInfo);
	});

	client.on("correction", function (correctionData) {
		client.broadcast.emit("player-correction", correctionData);
	});

	client.on("die", function (playerInfo) {
		client.broadcast.emit("player-die", playerInfo);
	});

	client.on("respawn", function (playerInfo) {
		client.broadcast.emit("player-respawn", playerInfo);
	});


	client.on("start-shoot", function (playerInfo) {
		client.broadcast.emit("player-start-shoot", playerInfo);
	});

	client.on("stop-shoot", function (playerInfo) {
		client.broadcast.emit("player-stop-shoot", playerInfo);
	});



});
server.listen(3000);

