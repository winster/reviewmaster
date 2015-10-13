var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var pg = require('pg');
var app     = express();

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

	url = req.body.url;
	var queryIndex=-1;
	if((queryIndex=url.indexOf('?'))>5) {
		url = url.substr(0, queryIndex)+'?type=all';
	}
	request(url, function(error, response, html){
	    if(!error){
	        var $ = cheerio.load(html);

		    var title, release, rating;
		    var json = { ratings : {}};

		    $('.ratings-section').filter(function(){
		        var data = $(this);
		        json.ratings.count = data.text();
		    })

		    $('.star-box-giga-star').filter(function(){
		        var data = $(this);
		        rating = data.text();

		        json.rating = rating;
		    })
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

    }) ;
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

exports = module.exports = app;

