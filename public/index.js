//import WebSocket from 'ws';

var ws = new WebSocket('ws://localhost:10000');

class Player {
	constructor(ws, id){
		this.ws = ws;
		this.id = id;
	}

	disconnect(){
		console.log('[INFO] Disconnectig');
		this.ws.send(JSON.stringify({
			'type': 'disconnect',
			'id': player.id,
		}));
	}
}
var player;

var activeUsers = [];

ws.onmessage = msg => {
	data = JSON.parse(msg.data);
	console.log(data);
	switch (data.type) {
		case 'setup':
			player = new Player(ws, data.id);
		break;
		case 'active_users':
			activeUsers = data.users;
			console.log('[INFO] Active users: ' + activeUsers);
		break;
	
		default:
			console.log('[ERROR] Could not parse message!')
		break;
	}
}

ws.onclose = () => player.disconnect();

ws.send(JSON.stringify({
	'type': 'play_with',
	'id': 1,
}))