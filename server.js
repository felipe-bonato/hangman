'use strict';

const db = require('./db');



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
		'nomes': ['Felipe'],
	});
	console.log('[INFO] User connected on http::home');
});

app.get('/play', (req, res) => {
	res.render('play/index', {
		'title': 'Play',
	});
	console.log('[INFO] User connected on http::play');
});

app.get('/add', (req, res) => {
	res.render('add/index', {
		'title': 'Add',
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

	insert() {
		this.lastId++;
		this.users[this.lastId] = {
			'status': this.status.IN_HOME,
		};
		return this.lastId;
	}

	getAll() {
		return this.users;
	}

	get(id) {
		return this.users[id];
	}

	remove(id) {
		delete this.users[id];
	}
}
const users = new ActiveUsers();

class Game {
	constructor() {
		this.db = require('../db');
	}

	async fetchRandomWord() {
		let rndWord = await this.db.getRandomWord();
		this.word = rndWord.split('');
		this.guessed = rndWord.split('').fill(null);

	}

	guess(letter) {
		
	}
}
const game = new Game();



/**
 * WEBSOCKET SERVER
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({
	port: 10000,
}, () => console.log('[SETUP] Started websocket server'));

wss.on('connection', ws => {
	console.log('[INFO] User connected on ws');
	
	ws.send(JSON.stringify({
		'type': 'setup',
		'id': users.insert(),
	}));

	ws.send(JSON.stringify({
		'type': 'active_users',
		'users': users.getAll(),
	}))
	
	ws.onmessage = msg => {
		const data = JSON.parse(msg.data);
		switch (data.type) {
			case 'disconnect':
				console.log('[INFO] User ' + data.id + ' disconnected');
				users.remove(data.id);
			break;
			case 'play_with':
				if (users.get(data.player) === undefined){
					ws.send(JSON.stringify({
						'type': 'error',
						'subtype': 'player_do_not_exists',
					}));
					return;
				}
			
				console.log('[INFO] Playing with: ' + data.player);

				game.fetchRandomWord()
					.then(() => {
						
					})
					.catch(console.error);


			break;
			case 'add_word':
				console.log('[INFO] Adding word: \"' + data.word + '\"');
			break;
			default:
				console.log('[ERROR] Could not parse message!')
			break;
		}
	};
});



