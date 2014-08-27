//Train
var unirest = require('unirest');
var REC_API_KEY = process.env.REC_API_KEY || '';

function train(album, album_key, entry_id, face_urls) {
	unirest.post("https://lambda-face-recognition.p.mashape.com/album_train")
	.header("X-Mashape-Key", REC_API_KEY)
	.field("album", album)
	.field("albumkey", album_key)
	.field("entryid", entry_id)
	//.attach("files", fs.createReadStream("<file goes here>"))
	.field("urls", face_urls)
	.end(function (result) {
  		console.log(result.status, result.headers, result.body);	
	});
}