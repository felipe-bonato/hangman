const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:10000');

ws.on('open', () => ws.send('Something'));