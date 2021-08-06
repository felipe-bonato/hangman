//import WebSocket from 'ws';

var ws = new WebSocket('ws://localhost:10000');

ws.onopen = () => {
	for(let i = 0; i < 10; i++){
		ws.send('oi');
	}
};

ws.onmessage = (msg) => {
	console.log(msg.data);
}


