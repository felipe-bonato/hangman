//mongod --dbpath=\data
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

const dbConfig = JSON.parse(fs.readFileSync('/home/felipebonato/repos/hangman/config/db.json'));

exports.getAllWords = async function getAllWords() {
	let conn; // We need to create this variable here because variables are block scoped.
	try {
		conn = await MongoClient.connect(dbConfig.url);
		const entries = await conn.db(dbConfig.name).collection('words').find({}).toArray();
		const words = entries.map(entry => entry.word);
		return words;
	} catch(e) {
		throw new Error('Could not get word from database\n' + e.toString());
	} finally {
		conn.close();
	}
}

exports.getRandomWord = async function getRandomWord() {
	let conn; // We need to create this variable here because variables are block scoped.
	try {
		conn = await MongoClient.connect(dbConfig.url);
		const entries = await conn.db(dbConfig.name).collection('words').find({}).toArray();
		const words = entries.map((entry) => entry.word);
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
		const stored_words = await this.getAllWords();
		if(stored_words.includes(word)) {
			throw new Error('Word already exists');
		}

		conn.db(dbName).collection('words').insertOne({'word': word});
	} catch(e) {
		throw new Error('Could not get word from database\n' + e.toString());
	} finally {
		conn.close();
	}
}

async function deleteAllWords() {
	const client = new MongoClient(url);
	try {
		const conn = await client.connect();
		conn.db(dbName).collection('words').deleteMany({});
	} catch {
		throw new Error('Could not get words from database');
	} finally {
		client.close();
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
