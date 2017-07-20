var server = require('http').createServer();
var io = require('socket.io')(server);
var extend = require('util')._extend;

var players = [];

io.on('connection', function (client) {

	client.on("createPlayerOnServer", function (data) {
		console.log("createPlayerOnServer", data);
		players.push(data);
		client.broadcast.emit("newPlayerJoined", data);
	});
	
	client.on("getPlayers",function(){
		client.emit("currentPlayerList",players);
		
	});
	
	client.on("ineedcorrections",function(){
		client.broadcast.emit("sendCorrections");		
	});

	client.on("engine-on", function (data) {
		console.log("engine-on", data);
		client.broadcast.emit("player-engine-on", data);
	});

	client.on("engine-off", function (data) {
		console.log("engine-off", data);
		client.broadcast.emit("player-engine-off", data);
	});

	client.on("move-forward", function (data) {
		console.log("move-forward", data);
		client.broadcast.emit("player-move-forward", data);
	});

	client.on("move-backward", function (data) {
		console.log("move-backward", data);
		client.broadcast.emit("player-move-backward", data);
	});

	client.on("stop-movement", function (data) {
		console.log("stop-movement", data);
		client.broadcast.emit("player-stop-movement", data);
	});

	client.on("rotate-right", function (data) {
		console.log("rotate-right", data);
		client.broadcast.emit("player-rotate-right", data);
	});

	client.on("rotate-left", function (data) {
		console.log("rotate-left", data);
		client.broadcast.emit("player-rotate-left", data);
	});

	client.on("stop-rotate", function (data) {
		console.log("stop-rotate", data);
		client.broadcast.emit("player-rotate-stop", data);
	});

	client.on("shoot", function (data) {
		console.log("shoot", data);
		client.broadcast.emit("player-shoot", data);
	});

	client.on("correction", function (data) {
		console.log("correction", data);
		client.broadcast.emit("player-correction", data);
	});

	client.on("hurt", function (data) {
		console.log("hurt", data);
		client.broadcast.emit("player-hurt", data);
	});

	client.on("die", function (data) {
		console.log("die", data);
		client.broadcast.emit("player-die", data);
	});

	client.on("respawn", function (data) {
		console.log("respawn", data);
		client.broadcast.emit("player-respawn", data);
	});

	client.on("start-shoot", function (data) {
		console.log("start-shoot", data);
		client.broadcast.emit("player-start-shoot", data);
	});

	client.on("stop-shoot", function (data) {
		console.log("stop-shoot", data);
		client.broadcast.emit("player-stop-shoot", data);
	});
	
	client.on("correction",function(data){
		console.log("correction",data);
		client.broadcast.emit("player-correction",data);		
	});

});

server.listen(3000);

