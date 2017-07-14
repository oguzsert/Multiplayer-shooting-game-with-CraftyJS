var server = require('http').createServer();
var io = require('socket.io')(server);

var players = {}

io.on('connection', function(client){

	client.on("createPlayerOnServer",function(player){
		players[player.id] = player;		
		client.broadcast.emit("newPlayerJoined",player);
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