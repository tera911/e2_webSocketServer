var WebSocketServer = require('websocket').server;
var http = require('http');

var userRequest = [];
var userConnections = [];

var server = http.createServer(function(request, response){
	console.log((new Date()) + 'Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8081, function(){
	console.log((new Date()) + ' Server is listening on port 8081 ');
});

wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnection: false
});

function originIsAllowed(origin){
	return true;
}

wsServer.on('request', function(request){
	if(!originIsAllowed(request.origin)){
		request.reject();
		console.log((new Date()) + 'Connection from origin '+ request.origin + 'rejected');
		return;
	}
	if(request.resourceURL.path == "/ringo"){
			userRequest.push(request);
			// WebSocket Access uri
			var connection = request.accept('echo-protocol', request.origin);
			console.log((new Date()) + 'Connection accepted');
			userConnections.push(connection);
			
			//echo-protocol message event;
			connection.on('message', function(message){
				console.log('msg is ' + message.utf8Data);
			});
			//echo-protocol close event;
			connection.on('close', function(responseCode, description){
				console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
			});
	}else if(request.resourceURL.path == "/mikan"){
			// WebSocket Access uri
			var connection = request.accept('echo-protocol', request.origin);
			console.log((new Date()) + 'Connection accepted');
			userConnections.push(connection);
			
			//echo-protocol message event;
			connection.on('message', function(message){
				console.log('mikan msg is ' + message.utf8Data);
			});
			//echo-protocol close event;
			connection.on('close', function(responseCode, description){
				console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
			});

	}else{
		request.reject();
	}
});
