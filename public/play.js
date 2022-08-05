const ws = new WebSocket('ws://localhost:10000');

const eGuessLetterButton = document.getElementById('play_guess-letter-button');
const eGuessLetterInput = document.getElementById('play_guess-letter-input')
const eGameState = document.getElementById('play_game-state');
const eHangMan = {
	'head': document.getElementById('hm-head'),
	'torso': document.getElementById('hm-torso'),
	'arms': {
		'left': document.getElementById('hm-larm'),
		'right': document.getElementById('hm-rarm'),
	},
	'legs': {
		'left': document.getElementById('hm-lleg'),
		'right': document.getElementById('hm-rleg'),
	},
}

eGuessLetterButton.addEventListener('click', evt => {
	ws.send(JSON.stringify({
		'type': 'play-guess_letter',
		'game': getGame(),
		'player': getPlayerSelf(),
		'guess': eGuessLetterInput.value
	}))
})

let _str = []
for (let i = 0; i < getWordLen(); i++) {
	_str.push('_');
}
setWordTo(_str);

let selfId;
ws.onmessage = msg => {
	data = JSON.parse(msg.data);
	console.log(data);
	switch (data.type) {
		case 'letters':
			setWordTo(data.letters);
			if(!data.correct){
				wrongLetter();
			} 
		break;
		case 'setup':
			selfId = data.id;
			ws.send(JSON.stringify({
				'type': 'play-game_setup',
				'game': getGame(),
				'player': data.id,
			}));
		break;
		case 'play-move':
			if(data.player == selfId){
				eGuessLetterButton.disabled = false;
				eGuessLetterInput.disabled = false;
				eGameState.innerText = 'Your turn'
			} else {
				eGuessLetterButton.disabled = true;
				eGuessLetterInput.disabled = true;
				eGuessLetterInput.value = '';
				eGameState.innerText = 'Other player turn'
			}
		break;
		case 'game_won':
			eGameState.innerText = 'You Won! 🎉'
			eGuessLetterButton.disabled = true;
			eGuessLetterInput.disabled = true;
			eGuessLetterInput.value = '';
		break;
		case 'game_lost':
			eGameState.innerText = 'You Lost!:('
		break;
		default:
		break;
	}
}

function getPlayerSelf(){
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('player1');
}

function getPlayerOther(){
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('player2');
}

function getGame(){
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('game');
}

function getWordLen(){
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('wordlen');
}

function setWordTo(str_array){
	const eWord = document.getElementById('word-guess')
	eWord.innerHTML = '';
	for (let i = 0; i < str_array.length; i++) {
		let fLetter = str_array[i] == null ? '_' : str_array[i]
		eWord.innerHTML += '<div id="leter-'+ (i + 1) + '">' + fLetter + '</div>'
	}
}

let static_wrongLetter = 0;
function wrongLetter() {
	static_wrongLetter++;
	switch(static_wrongLetter) {
		case 1:
			killPart(eHangMan.legs.left);
		break;
		case 2:
			killPart(eHangMan.legs.right);
		break;
		case 3:
			killPart(eHangMan.arms.left);
		break;
		case 4:
			killPart(eHangMan.arms.right);
		break;
		case 5:
			killPart(eHangMan.torso);
		break;
		case 6:
			killPart(eHangMan.head);
			eGuessLetterButton.disabled = true;
			eGuessLetterInput.disabled = true;
		break;
	}
}

function killPart(part) {
	part.innerHTML = '<del>' + part.innerText + '</del>';
}

/*ws.send(JSON.stringify({
	'type': 'play-game_setup',
	'game': getGame(),
	'player1': getPlayerSelf(),
	'player2': getPlayerOther()
}));*/

window.addEventListener('beforeunload', () => ws.send(JSON.stringify({
	'type': 'disconnect',
	'id': getPlayerSelf(),
})));