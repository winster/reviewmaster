var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var pg = require('pg');
var sentiment = require('indiansentiment');
var app = express();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});


app.post('/', urlencodedParser, function(req, res){

	var purl = req.body.url;
	var rurl;
	var queryIndex=-1;
	if((queryIndex=purl.indexOf('?'))>5) {
		rurl = purl.substr(0, queryIndex)+'?type=all';
	} else {
		rurl = purl+'?type=all';
	}	
    var json={};
    json.ratings={};
    json.ratings.sentiment={};
    json.product={};
    request(purl, function(error, response, html){
    	if(!error){
    		var $ = cheerio.load(html);
    		$('.productImage').filter(function(){
		        var elt = $(this).children().first();
		        json.product.img = elt.src;
		    });
    	}
		request(rurl, function(error, response, html){
		    if(!error){
		        var $ = cheerio.load(html);
			    $('.review-list').filter(function(){
			        var data = $(this);
			        var senti = sentiment(data.text());
			        json.ratings.sentiment.score = senti.score;
			        json.ratings.sentiment.comparative = senti.comparative;
			    });
			}

		// To write to the system we will use the built in 'fs' library.
		// In this example we will pass 3 parameters to the writeFile function
		// Parameter 1 :  output.json - this is what the created filename will be called
		// Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
		// Parameter 3 :  callback function - a callback function to let us know the status of our function

			fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

			    console.log('File successfully written! - Check your project directory for the output.json file');

			})
			console.log(json);
		// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
			res.render('pages/index', {data:json});

	    });
	});
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

exports = module.exports = app;

