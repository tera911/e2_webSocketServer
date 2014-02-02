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
			userConnections.push(connection);
			/**
				bigScreenからのメッセージ
			*/
			connection.on('message', function(message){
				try{
					var recvData = JSON.parse(message.utf8Data);
					console.log('event code is '+ recvData.eventCode);
					if(recvData.type == "join"){
						eventBigScreen[recvData.eventCode] 	= 	connection;
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
			console.log('receivedata is : ' + recvData.eventCode);
		
			if(eventBigScreen[recvData.eventCode] != null){
				eventUser[recvData.eventCode].push(connection);
			}else{
				request.reject(404);
			}
		break;

/* ADD 		*/
		case "add" :
			obj 				=	{};
			obj.type 			= 	"add";
			obj.id 				= 	recvData.id;
			obj.shapeCode 		= 	recvData.shapeCode;
			obj.colorCode 		=	recvData.colorCode;
			obj.text			=	recvData.text;
			//send obj
			eventBigScreen[recvData.eventCode].send(JSON.stringify(obj));
			;
		break;
/* MOVE		 */
		case "move" :
			obj 			= 	{};
			obj.type 		=	"move";
			obj.id 			= 	recvData.id;
			obj.o 			= 	{};
			obj.o.type 		= 	COMMAND_MOVE;
			obj.o.x 		=	recvData.x;
			obj.o.y			= 	recvData.y;
			//send obj 
			eventBigScreen[recvData.eventCode].send(JSON.stringify(obj));
		break;
/* RESIZE	 */
		case "resize" :
			obj 			=	{};
			obj.type		=	"move";
			obj.id 			= 	recvData.id;
			obj.o 			= 	{};
			obj.o.type 		= 	COMMAND_RESIZE;
			obj.o.size		=	recvData.size;
			//send obj
			eventBigScreen[recvData.eventCode].send(JSON.stringify(obj));
			;
		break;
	}
}

