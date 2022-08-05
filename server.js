'use strict';

const db = require('./db')

/**
 * HTTP SERVER
 */
const express = require('express');
const app = express();

const nunjucks = require('nunjucks');
nunjucks.configure('views', {
	autoescape: true,
	express: app,
})

app.set('views', './views');
app.set('view engine', 'nunjucks');
app.use(express.static(__dirname + '/public'));


app.get('/', (req, res) => {
	res.render('home/index', {
		'title': 'Home',
	});
	console.log('[INFO] User connected on http::home');
});

app.get('/play', (req, res) => {
	res.render('play/index', {
		'title': 'Play',
	});
	console.log('[INFO] User connected on http::play');
});

app.get('/add', async (req, res) => {
	res.render('add/index', {
		'title': 'Add',
		'words': await db.fetchAllWords(),
	});
	console.log('[INFO] User connected on http::add');
});

app.listen(4000, () => {
	console.log('[SETUP] Started http server');
});



/**
 * GAME LOGIC
 */



class ActiveUsers {
	constructor(){
		this.users = {};
		this.lastId = 0; // Id of the last user added
	
		this.status = {
			IN_HOME: 'IN_HOME_STR',
			PLAYING: 'PLAYING_STR',
		}
	}

	insert(ws) {
		this.lastId++;
		this.users[this.lastId] = {
			'id': this.lastId,
			'ws': ws,
			'status': this.status.IN_HOME,
		};
		return this.lastId;
	}

	getAll() {
		return this.users;
	}

	getAllIds(){
		let ids = []
		for (const [key, value] of Object.entries(this.users)) {
			ids.push(parseInt(key));
		}
		return ids;
	}

	get(id) {
		return this.users[id];
	}

	remove(id) {
		delete this.users[id];
	}
}
const users = new ActiveUsers();

var static_gameId = 0;
var static_games = []
class Game {
	constructor(player1, player2) {
		this.player1 = player1
		this.player1.ws.game = this;
		this.player2 = player2
		this.player2.ws.game = this;
		this.db = require('./db');
		this.gameId = static_gameId++;
		static_games[this.gameId] = this;
		this.nextPlayerToPlay = player1;
		this.wrongGuesses = 0;
	}

	async fetchRandomWord() {
		let rndWord = await this.db.fetchRandomWord();
		console.log('[INFO] Game ' + this.gameId + ' selected the word "' + rndWord + '"');
		this.word = rndWord.split('');
		this.guessed = rndWord.split('').map(letter => letter == ' ' ? ' ' : null); //fill null
		return this.word.length;
	}

	guess(letter) {
		let correct = false;
		if(letter){
			letter = letter.toUpperCase();
			for (let i = 0; i < this.word.length; i++) {
				if(letter == this.word[i]){
					this.guessed[i] = this.word[i]
					correct = true;
				}
			}
		}
		if(!correct) this.wrongGuesses++;

		return [this.guessed, correct];
	}

	getNextPlayerToPlay() {
		this.nextPlayerToPlay = this.nextPlayerToPlay == this.player1 ? this.player2 : this.player1;
		return this.nextPlayerToPlay.id;
	}

	static getGameById(id) {
		return static_games[id]
	}

	sendToAllPlayers(msg) {
		this.player1.ws.send(msg);
		this.player2.ws.send(msg);
	}

	isWon() {
		return this.word.length === this.guessed.length
			&& this.word.every((v, i) => v === this.guessed[i]);
	}

	isLost(){
		return this.wrongGuesses >= 6; // Number o member for the stick figure
	}
}


/**
 * WEBSOCKET SERVER
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({
	port: 10000,
}, () => console.log('[SETUP] Started websocket server'));

const clients = [];
wss.on('connection', ws => {
	ws.send(JSON.stringify({
		'type': 'setup',
		'id': users.insert(ws),
	}));
	console.log('[INFO] User connected on ws');
	console.log('[INFO] Users: ', users.getAllIds());
	
	ws.send(JSON.stringify({
		'type': 'active_users',
		'users': users.getAll(),
	}))
	
	ws.onmessage = msg => {
		const data = JSON.parse(msg.data);
		console.log(data)
		let game;
		switch (data.type) {
			case 'disconnect':
				console.log('[INFO] User ' + data.id + ' disconnected');
				users.remove(data.id);
				console.log('[INFO] Users: ', users.getAllIds());
			break;
			case 'play_with':
				if (users.get(data.player1) === undefined || users.get(data.player2) === undefined){
					ws.send(JSON.stringify({
						'type': 'error',
						'subtype': 'player_do_not_exists',
					}));
					return;
				}

				console.log('[INFO] Playing with: ' + data.player2);
				
				game = new Game(users.get(data.player1), users.get(data.player2));
				users.get(data.player1).ws.game = game;
				users.get(data.player2).ws.game = game;
				game.fetchRandomWord()
					.then(wordLen => {
						game.player1.ws.send(JSON.stringify({
							'type': 'play',
							'game': {
								'id': game.gameId,
								'player1': game.player1.id,
								'player2': game.player2.id,
								'word_len': wordLen
							}
						}));
						game.player2.ws.send(JSON.stringify({
							'type': 'play',
							'game': {
								'id': game.gameId,
								'player1': game.player2.id,
								'player2': game.player1.id,
								'word_len': wordLen
							}
						}));
					})
					.catch(console.error);


			break;
			case 'add_word':
				// Add word to db
				let word = data.word.trim();
				db.insertWord(word)
					.then(async () => {
						console.log('[INFO] Adding word \"' + word + '\"');
						ws.send(JSON.stringify({
							'type': 'get_all_words',
							'words': await db.fetchAllWords().catch(console.error),
						}));
					})
					.catch(e => {
						console.log('[INFO] Word \"' + word + '\" is already in db');
						ws.send(JSON.stringify({
							'type': 'error',
							'subtype': 'word_already_exists',
						}));
					});
			break;
			case 'get_active_players':
				ws.send(JSON.stringify({
					'type': 'active_users',
					'users': users.getAll(),
				}));
			break;
			case 'play-guess_letter':
				game = Game.getGameById(data.game);
				let [guess, correct] = game.guess(data.guess.trim()[0]);
				
				sendLetters(game.player1.ws, guess, correct);
				sendLetters(game.player2.ws, guess, correct);
				
				if(game.isWon()){
					game.sendToAllPlayers(JSON.stringify({
						'type': 'game_won'
					}));
				} else if(game.isLost()){
					game.sendToAllPlayers(JSON.stringify({
						'type': 'game_lost'
					}));
				} else {
					game.sendToAllPlayers(JSON.stringify({
						'type': 'play-move',
						'player': game.getNextPlayerToPlay(),
					}));
				}
			break;
			case 'play-game_setup':
				game = Game.getGameById(data.game);
				if(game.player1.status === users.status.IN_HOME){
					game.player1 = users.get(parseInt(data.player))
					game.player1.status = users.status.PLAYING;
				} else {
					game.player2 = users.get(parseInt(data.player))
					game.player2.status = users.status.PLAYING;
				}

				if(game.player1.status === users.status.PLAYING && game.player2.status === users.status.PLAYING){
					game.sendToAllPlayers(JSON.stringify({
						'type': 'play-move',
						'player': game.getNextPlayerToPlay(),
					}));
				} else {
					ws.send(JSON.stringify({
						'type': 'wating-player',
					}));
				}
				//console.log(game);
			break;
			default:
				console.log('[ERROR] Could not parse message!')
			break;
		}
	};
});

function sendLetters(ws, letters, correct){
	ws.send(JSON.stringify({
		'type': 'letters',
		'letters': letters,
		'correct': correct
	}));
}