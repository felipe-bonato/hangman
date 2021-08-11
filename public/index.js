var ws = new WebSocket('ws://localhost:10000');

playWith = {}
playWith.button = document.getElementById('play_with--button');
playWith.input = document.getElementById('play_with--input');

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

var activeUsers = {};

playWith.button.addEventListener('click', evt => {
	ws.send(JSON.stringify({
		'type': 'play_with',
		'player': parseInt(playWith.input.value),
	}));
	window.location.replace('/play');
});

ws.onmessage = msg => {
	data = JSON.parse(msg.data);
	switch (data.type) {
		case 'setup':
			player = new Player(ws, data.id);
		break;
		case 'active_users':
			activeUsers = data.users;
			console.log('[INFO] Active users: '); console.log(activeUsers);
		break;
		default:
			console.log('[ERROR] Could not parse message!')
		break;
	}
}

window.addEventListener('beforeunload', () => player.disconnect());
//ws.onclose = () => player.disconnect();
