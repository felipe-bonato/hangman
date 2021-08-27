const ws = new WebSocket('ws://localhost:10000');

const EAddWordButton = document.getElementById('add_word--button');
const EAddWordInput = document.getElementById('add_word--input');

EAddWordButton.addEventListener('click', evt => {
	const word = EAddWordInput.value;
	console.log(word);
	if (word) {
		ws.send(JSON.stringify({
			'type': 'add_word',
			'word': word,
		}));
	} else {
		const EAddWordError = document.getElementById('add_word--error');
		EAddWordError.style.display = 'inline';
		EAddWordError.innerText = 'Invalid Word'
	}

});





