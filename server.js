var server = require('http').createServer();
var io = require('socket.io')(server);

var players = {}

io.on('connection', function(client){

	client.on("createPlayerOnServer",function(player){
		players[player.id] = player;		
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
  
  
});
server.listen(3000);


/*
client.on("addPlayer",function(newPlayerData){
	  console.log(newPlayerData);
	  players.push(newPlayerData);
  });
	client.on("playerPositionUpdate",function(newPositionData){
		 players.forEach(function(player){
			 if(player.color == newPositionData.color){
				 player.x = newPositionData.x;
				 player.y = newPositionData.y;
			 }			 
		 });
		 
		 client.broadcast.emit("players",players);
		
	});
  
  client.on('event', function(data){});
  client.on('disconnect', function(){});*/