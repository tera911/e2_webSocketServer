var WebSocketServer = 	require('websocket').server;
var http 			= 	require('http');

var eventUser 		= 	{};
var eventBigScreen 	= 	{};

//test
var userRequest = [];
var userConnections = [];
var data ;


//event type

var COMMAND_STAY	= 1;
var COMMAND_MOVE 	= 2;
var COMMAND_RESIZE 	= 3;
var COMMAND_OPACITY = 4;
var COMMAND_REMOVE 	= 5;

var server = http.createServer(function(request, response){
	console.log((new Date()) + 'Received request for ' + request.url);
	if(request.url.match(/\/\S*\/hosts$/) && request.method == 'POST'){
			var eventCode = request.url.substr(1).replace("/hosts","");
			response.writeHead(200, {'Access-Control-Allow-Origin': '*'});
			var data = '';
			request.on('data',function(chunk){
				data += chunk;
			});
			request.on('end', function(){
				var o = require('url').parse('?' + data, true).query;
				if(eventBigScreen[eventCode] != null){
					eventBigScreen[eventCode].forEach(function(e){
						e.send(JSON.stringify(o));
					});
					console.log('send host message, '+ eventCode);
				}
			});
	}else{
		response.writeHead(404);
	}
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
					console.log(receiveData.type + ' : ' + receiveData.eventCode);
					MessageChooser(request, connection, receiveData);
				}catch(e){}
			});

			connection.on('close', function(responseCode, description){
				console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
			});

	//bigscreen用のイベント ws://::/bigscreen
	}else if(request.resourceURL.path == "/bigscreen"){
			var connection = request.accept(null, request.origin);
			console.log((new Date()) + 'Connection accepted');
			/**
				bigScreenからのメッセージ
			*/
			connection.on('message', function(message){
				try{
					var recvData = JSON.parse(message.utf8Data);
					console.log('event code is '+ recvData.eventCode);
					if(recvData.type == "join"){
						if(eventBigScreen[recvData.eventCode] == null){
							eventBigScreen[recvData.eventCode] = new Array();
						}
						eventBigScreen[recvData.eventCode].push(connection);
						eventUser[recvData.eventCode]		= 	new Array();
					}else{
						request.reject(404);
					}
				}catch(e){}				
			});
			
			//bigScreenとの接続が切れたとき
			connection.on('close', function(responseCode, description){
				
			});

	}else{
		request.reject();
	}
});

function MessageChooser(request, connection, recvData){
	data = recvData;

	switch(recvData.type){

/* JOIN 	*/
		case "join":
			if(eventBigScreen[recvData.eventCode] != null){
				eventUser[recvData.eventCode].push(connection);
			}else{
				request.reject(404);
			}
		break;

/*		その他	*/
		default:
			if(eventBigScreen[recvData.eventCode] != null){
				eventBigScreen[recvData.eventCode].forEach(function(e){
					e.send(JSON.stringify(recvData));
				});
			}
		break;
	}
}

