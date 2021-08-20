const MongoClient = require('mongodb').MongoClient;
//mongod --dbpath=\data

const url = 'mongodb://localhost:27017';
const dbName = 'hangman';

/**
 * @param cb function(db_connection, errors)
 */
function getBbConnection(cb)
{
	const client = new MongoClient(url);
	client.connect((err) => {
		if(err){
			cb(null, new Error('Could not connect to db.\n' + err))
		} else {
			cb(client.db(dbName), null);
		}
		setTimeout(() => client.close(), 500); // <- Isso é uma estupidez
	});
}

/**
 * 
 * @param cb function(words, err)
 */
exports.getAllWords = function getAllWords(cb) {
	getBbConnection((db, err) => {
		if(err){
			cb(null, err);
		} else {
			db.collection('words').find({}).toArray((err, docs) => {
				if(err){
					cb(null, new Error('Could not get words from database'));
				} else {
					cb(docs.map((word_pair) => word_pair.word), null);
				}
			});
		}
	});
}

/**
 * @param cb function(word, err)
 */
exports.getRandomWord = function getRandomWord(cb) {
	getBbConnection((db, err) => {
		if(err){
			cb(null, err);
		} else {
			db.collection('words').find({}).toArray((err, docs) => {
				if(err){
					cb(null, new Error('Could not get words from database'));
				} else {
					words = docs.map((word_pair) => word_pair.word)
					cb(words[Math.floor(Math.random() * words.length)], null);
				}
			});
		}
	});
}

exports.insertWord = function insertWord(word, cb) {
	word = word.toUpperCase();
	getBbConnection((db, err) => {
		if(err){
			cb(null, err);
		} else {
			getAllWords((words, err) => {
				if(err){
					cb(null, new Error('Could not get words from database'));
				} else if(words.includes(word)){
					cb(null, new Error('Word already into database into database'));
				} else {
					db.collection('words').insertOne({
						'word': word,
					}, (err, r) => {
						if(err){
							cb(null, new Error('Could not insert word into database'));
						} else if(r.insertedCount > 1){
							cb(null, new Error('Could not insert single word into database'));
						} else {
							cb(r, null);
						}		
					});
				}
			});
		}
	});
}

function deleteAllWords(cb) {
	getBbConnection((db, err) => {
		if(err){
			cb(null, err);
		} else {
			db.collection('words').deleteMany({}, (err, result) => {
				if(err){
					cb(null, new Error('Could not connect to DB.\n' + err));
				} else {
					cb(result, null);
				}
			});
		}
	});
}
