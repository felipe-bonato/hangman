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
		EAddWordError.innerText = 'Invalid Word'
	}

});


ws.onmessage = msg => {
	data = JSON.parse(msg.data);
	console.log(data)
	switch (data.type) {
		case "get_all_words":
			let eWords = document.getElementsByClassName('words-con')[0];
			eWords.innerHTML = ''
			data.words.forEach(word => {
				eWords.innerHTML += '<div class="word"><span>' + word + '</span></div>'
			});
		break;
		case "error":
			switch (data.subtype) {
				case "word_already_exists":
					document.getElementById('add_word--error').innerText = 'Word already exists';
				break;
				default:
					document.getElementById('add_word--error').innerText = 'An error occured';
				break;
			}
			

		break;
		default:
			break;
	}
}

