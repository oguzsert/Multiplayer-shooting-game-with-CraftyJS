var server = require('http').createServer();
var io = require('socket.io')(server);



io.on('connection', function(client){

	client.on("createPlayerOnServer",function(player){
			
		client.broadcast.emit("newPlayerJoined",player);
	});
	
	client.on("engine-on",function(playerId){		
		client.broadcast.emit("player-engine-on",playerId);
	});
	
	client.on("engine-off",function(playerId){		
		client.broadcast.emit("player-engine-off",playerId);
	});
	
	client.on("move-forward",function(playerId){		
		client.broadcast.emit("player-move-forward",playerId);
	});
	
	client.on("move-backward",function(playerId){		
		client.broadcast.emit("player-move-backward",playerId);
	});
	
	client.on("stop-movement",function(playerId){		
		client.broadcast.emit("player-stop-movement",playerId);
	});
	
	client.on("rotate-right",function(playerId){		
		client.broadcast.emit("player-rotate-right",playerId);
	});
	
	client.on("rotate-left",function(playerId){		
		client.broadcast.emit("player-rotate-left",playerId);
	});
	
	client.on("stop-rotate",function(playerId){		
		client.broadcast.emit("player-rotate-stop",playerId);
	});
	
	client.on("shoot",function(playerId){
		client.broadcast.emit("player-shoot",playerId);		
	});
	
	client.on("correction",function(correctionData){
		client.broadcast.emit("player-correction",correctionData);		
	});
	
	client.on("die",function(playerId){		
		client.broadcast.emit("player-die",playerId);
	});
	
	client.on("respawn",function(playerId){		
		client.broadcast.emit("player-respawn",playerId);
	});
  
  
  
});
server.listen(3000);

