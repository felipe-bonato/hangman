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

/**
 * Refresh list
 */
document.getElementById('home--online-players_refresh').addEventListener('click', evt => {
	ws.send(JSON.stringify({
		'type': 'get_active_players',
	}));
});

ws.onmessage = msg => {
	data = JSON.parse(msg.data);
	switch (data.type) {
		case 'setup':
			player = new Player(ws, data.id);
		break;
		case 'active_users':
			document.getElementById('home--players').innerHTML = ""
			for (const [key, value] of Object.entries(data.users)) {
				if(value.status === "IN_HOME_STR" && parseInt(key) !== player.id){
					document.getElementById('home--players').innerHTML += '<div class="home--player"><button class="home--play_with">' + key + '</button></div>'
				}
			}
			// Add listener for the buttons
			for(const player_online of document.getElementsByClassName('home--play_with')){
				player_online.addEventListener('click', () => {
					ws.send(JSON.stringify({
						'type': 'play_with',
						'player1': player.id,
						'player2': parseInt(player_online.innerText),
					}));
				});
			};
		
		break;
		case 'play':
			window.location.replace(
				window.location + 'play?'
				+ 'game=' + data.game.id
				+ '&player1=' + data.game.player1
				+ '&player2=' + data.game.player2
				+ '&wordlen=' + data.game.word_len
			)
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
