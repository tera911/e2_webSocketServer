var WebSocketServer = require('websocket').server;
var http = require('http');

var eventCode = { 'e_000' : new Array()};

//test
var userRequest = [];
var userConnections = [];
var data ;

var server = http.createServer(function(request, response){
	console.log((new Date()) + 'Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8082, function(){
	console.log((new Date()) + ' Server is listening on port 8082 ');
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
	//クライアント用のイベント ws://::/client
	if(request.resourceURL.path == "/client"){
			var connection = request.accept(null, request.origin);
			console.log((new Date()) + 'Connection accepted : ' + connection.socket.remoteAddress);
			userConnections.push(connection);
			
			/**
			visitorから受けるメッセージ
			*/
			connection.on('message', function(message){
				var receiveData;
				try{
					receiveData = JSON.parse(message.utf8Data);
					MessageChooser(receiveData);
				}catch(e){}
			});

			connection.on('close', function(responseCode, description){
				console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
			});

	//bigscreen用のイベント ws://::/bigscreen
	}else if(request.resourceURL.path == "/bigscreen"){
			

			var connection = request.accept(null, request.origin);
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

function MessageChooser(recvData){
	data = recvData;

	switch(recvData.type){

/* JOIN 	*/
		case "join":
			console.log('receivedata is : ' + recvData.eventCode);
		
			if(eventCode[recvData.eventCode] != null){
				eventCode[recvData.eventCode].push(connection);
			}else{
				request.reject(404);
			}
		break;

/* ADD 		*/
		case "add" :
			;
		break;

/* RESIZE	 */
		case "resize" :
			;
		break;
	}
}