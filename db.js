const MongoClient = require('mongodb').MongoClient;
//mongod --dbpath=\data

const url = 'mongodb://localhost:27017';
const dbName = 'hangman';

const client = new MongoClient(url);

function insert_word(word, cb) {
	client.connect((err) => {
		if(err){
			cb(null, new Error('Could not connect to db\n[ERROR] Message: ' + err))
		} else {
			console.log('[INFO] Successfully coneect to db');
			const db = client.db(dbName);

			get_all_words((data, err) => {
				if(err){
					cb(null, '[ERROR] Could not get words from database');
				} else if(data.includes(word)){
					cb(null, new Error('Word already into database into database'));
				} else {
					db.collection('words').insertOne({
						'word': word,
					}, (err, r) => {
						if(err){
							cb(null, '[ERROR] Could not insert word into database');
						} else if(r.insertedCount > 1){
							cb(null, '[ERROR] Could not insert single word into database');
						}			
					});
				}
			});
		}
	});
}

function get_all_words(cb) {
	client.connect((err) => {
		if(err){
			cb(null ,new Error('Could not connect to db\n[ERROR] ' + err));
			return;
		}
		console.log('[INFO] Successfully coneect to db');
		const db = client.db(dbName);
	
		db.collection('words').find({}).toArray((err, docs) => {
			if(err){
				cb(null, '[ERROR] Could not get words from database');
				return;
			}
			cb(docs.map((word_pair) => word_pair.word), null);
		})
	});
}

function get_random_word(cb) {
	client.connect((err) => {
		if(err){
			cb(null, new Error('Could not connect to db\n[ERROR] Message: ' + err));
			return;
		}
		console.log('[INFO] Successfully coneect to db');
		const db = client.db(dbName);
	
		db.collection('words').find({}).toArray((err, docs) => {
			if(err){
				cb(null, '[ERROR] Could not insert word into database');
				return;
			}
			console.log(docs)
		})
	});
}

function delete_all_words(cb) {
	client.connect((err) => {
		if(err){
			cb(null, new Error('Could not connect to db\n[ERROR] Message: ' + err));
			return;
		}
		console.log('[INFO] Successfully coneect to db');
		const db = client.db(dbName);
	
		db.collection('words').deleteMany({}, (err, result) => {
			if(err){
				cb(null, '[ERROR] Could not connect to db\n[ERROR] Message: ' + err);
				return;
			}
			console.log('[INFO] Successfully deleted ' + result.deletedCount + ' entries!');
			cb(result, null);
		});
	});
}


insert_word('Cellphone', (data, err) => {
	console.error(err)
	console.log(data);
});
get_all_words((data, err) => {
	err ? console.error(err) : console.log(data);
});


