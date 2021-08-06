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

const WebSocket = require('ws');

const wss = new WebSocket.Server({
	port: 10000,
}, () => console.log('Started websocket server'));

wss.on('connection', (ws) => {
	console.log('User connected on ws')
	ws.on('message', (msg) => {
		console.log('Recievied: %s', msg);
	});
	ws.send('Server message');
});
