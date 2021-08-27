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
	playWithPlayer = parseInt(playWith.input.value)
	ws.send(JSON.stringify({
		'type': 'play_with',
		'player': playWithPlayer,
	}));
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
		case 'error':
			let errors = []

			if (data.errorType == 'player_do_not_exists') {
				errors.push({
					'title': 'Could not finda player',
					'description': 'You are trying to play with a player wich is not connected',
				});
			}

			window.location.replace('/');
		
			const errorsElement = document.getElementById('flash-errors');
			errorsElement.style.display = 'block';

			for (let error of errors) {
				let errorElement = document.createElement('div');
				//let errorTitleElement = document.createElement('h1');
				//let errroDescriptionElement = document.createElement('p');

				errorElement.className += 'error'
				errorElement.innerHTML = '<h1 class="error-title">' + error.title + '</h1><p class="error-description">' + error.description + '</p>';
			
				errorsElement.appendChild(errorElement);
			}
		break;
		default:
			console.log('[ERROR] Could not parse message!');
		break;
	}
}

window.addEventListener('beforeunload', () => player.disconnect());
//ws.onclose = () => player.disconnect();
