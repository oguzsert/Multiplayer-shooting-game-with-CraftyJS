var server = require('http').createServer();
var io = require('socket.io')(server);



io.on('connection', function(client){

	client.on("createPlayerOnServer",function(player){
			
		client.broadcast.emit("newPlayerJoined",player);
	});
	
	client.on("engine-on",function(playerInfo){		
		client.broadcast.emit("player-engine-on",playerInfo);
	});
	
	client.on("engine-off",function(playerInfo){		
		client.broadcast.emit("player-engine-off",playerInfo);
	});
	
	client.on("move-forward",function(playerInfo){		
		client.broadcast.emit("player-move-forward",playerInfo);
	});
	
	client.on("move-backward",function(playerInfo){		
		client.broadcast.emit("player-move-backward",playerInfo);
	});
	
	client.on("stop-movement",function(playerInfo){		
		client.broadcast.emit("player-stop-movement",playerInfo);
	});
	
	client.on("rotate-right",function(playerInfo){		
		client.broadcast.emit("player-rotate-right",playerInfo);
	});
	
	client.on("rotate-left",function(playerInfo){		
		client.broadcast.emit("player-rotate-left",playerInfo);
	});
	
	client.on("stop-rotate",function(playerInfo){		
		client.broadcast.emit("player-rotate-stop",playerInfo);
	});
	
	client.on("shoot",function(playerInfo){
		client.broadcast.emit("player-shoot",playerInfo);		
	});
	
	client.on("correction",function(correctionData){
		client.broadcast.emit("player-correction",correctionData);		
	});
	
	client.on("die",function(playerInfo){		
		client.broadcast.emit("player-die",playerInfo);
	});
	
	client.on("respawn",function(playerInfo){		
		client.broadcast.emit("player-respawn",playerInfo);
	});
	
	
	client.on("start-shoot",function(playerInfo){		
		client.broadcast.emit("player-start-shoot",playerInfo);
	});
	
	client.on("stop-shoot",function(playerInfo){		
		client.broadcast.emit("player-stop-shoot",playerInfo);
	});
  
  
  
});
server.listen(3000);

