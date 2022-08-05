//mongod --dbpath=\data
const MongoClient = require('mongodb').MongoClient
const fs = require('fs');
const dbConfig = JSON.parse(fs.readFileSync('/home/felipebonato/repos/hangman/config/db.json'));

exports.fetchAllWords = async function fetchAllWords() {
	let conn; // We need to create this variable here because variables are block scoped.
	try {
		conn = await MongoClient.connect(dbConfig.url);
		const entries = await conn.db(dbConfig.name).collection('words').find({}).toArray();
		const words = entries.map(entry => entry.word);
		return words;
	} catch(e) {
		throw new Error('Could not get word from database\n' + e.toString());
	} finally {
		//conn.close();
	}
}

exports.fetchRandomWord = async function fetchRandomWord() {
	let conn; // We need to create this variable here because variables are block scoped.
	try {
		conn = await MongoClient.connect(dbConfig.url);
		const entries = await conn.db(dbConfig.name).collection('words').find({}).toArray();
		const words = entries.map(entry => entry.word);
		return words[Math.floor(Math.random() * words.length)];
	} catch(e) {
		throw new Error('Could not get word from database\n' + e.toString());
	} finally {
		conn.close();
	}
}

exports.insertWord = async function insertWord(word) {
	word = word.toUpperCase();
	let conn; // We need to create this variable here because variables are block scoped.
	try {
		conn = await MongoClient.connect(dbConfig.url);
		
		// Checks if already in db
		const stored_words = await this.fetchAllWords();
		if(stored_words.includes(word)) {
			throw new Error('Word already exists');
		}

		await conn.db(dbConfig.name).collection('words').insertOne({'word': word});
	} finally {
		conn.close();
	}
}

async function deleteAllWords() {
	let conn; // We need to create this variable here because variables are block scoped.
	try {
		conn = await MongoClient.connect(dbConfig.url);
		// We don't need to await this one!
		conn.db(dbName).collection('words').deleteMany({});
	} catch(e) {
		throw new Error('Could not get word from database\n' + e.toString());
	} finally {
		conn.close();
	}
}
