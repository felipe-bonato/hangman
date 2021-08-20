const MongoClient = require('mongodb').MongoClient;
//mongod --dbpath=\data

const url = 'mongodb://localhost:27017';
const dbName = 'hangman';

exports.getAllWords = async function getAllWords() {
	const client = new MongoClient(url);
	try {
		const conn = await client.connect();
		const words = await conn.db(dbName).collection('words').find({}).toArray();
		return words.map((word_pair) => word_pair.word);
	} catch {
		throw new Error('Could not get words from database');
	} finally {
		client.close();
	}
}

exports.getRandomWord = async function getRandomWord() {
	const client = new MongoClient(url);
	try {
		const conn = await client.connect();
		const words = await conn.db(dbName).collection('words').find({}).toArray();
		const words_arr = words.map((word_pair) => word_pair.word);
		return words_arr[Math.floor(Math.random() * words_arr.length)];
	} catch {
		throw new Error('Could not get words from database');
	} finally {
		client.close();
	}
}

exports.insertWord = async function insertWord(word) {
	const client = new MongoClient(url);
	const word = word.toUpperCase();
	try {
		const conn = await client.connect();
		const stored_words = await getAllWords();
		if(stored_words.includes(word)) throw new Error('Word already exists');
		conn.db(dbName).collection('words').insertOne({'word': word});
	} catch {
		throw new Error('Could not get words from database');
	} finally {
		client.close();
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
