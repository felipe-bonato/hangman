'use strict';

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
		'nomes': ['João', 'Felipe'],
	});
	console.log('User connected on http::home');
});

app.get('/play', (req, res) => {
	res.render('play/index', {
		'title': 'Play',
	});
	console.log('User connected on http::play');
});

app.get('/add', (req, res) => {
	res.render('add/index', {
		'title': 'Add',
	});
	console.log('User connected on http::add');
});

app.listen(4000, () => {
	console.log('Started http server');
});





/**
 * WEBSOCKET SERVER
 */

class ActiveUsers {
	constructor(){
		this.users = [];
		this.lastId = 0; // Id of the last user added
	}

	insert() {
		this.lastId++;
		this.users.push(this.lastId);
		return this.lastId;
	}

	getAll() {
		return this.users;
	}

	remove(id) {
		this.users.filter((value, index, arr) => value !== id)
	}
}
const users = new ActiveUsers();

const WebSocket = require('ws');

const wss = new WebSocket.Server({
	port: 10000,
}, () => console.log('Started websocket server'));

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
	
	ws.on('message', msg => {
		data = JSON.parse(msg.data);
		console.log('Recieved message: ' + data);
		switch (data.type) {
			case 'disconnect':
				console.log('[INFO] User ' + data.id + 'disconnected');
				users.remove(data.id);
			break;
			case 'play_with':
				console.log('[INFO] Playing with ' + data.id);
			break;
			default:
			break;
		}
	});
});

