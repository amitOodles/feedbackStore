var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/tima');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

var CronJob = require('cron').CronJob;



var mailOptions = {
    from: '"Amit" <amit.k@oodlestechnologies.com>', // sender address
    to: 'amitnirwal80@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

var job = new CronJob('00 02 * * * *', function(){
  }, function (){
    transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
  },
  start : false,
  timeZone : 'Asia/Kolkata'
);

job.start();

const bodyParser = require('body-parser');

app.use(bodyParser.json());


// if our user.js file is at app/models/user.js
var User = require('./models/User');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.post("/mongo",function(req,res){

	var data = req.body;

	console.log(data);

	var user = new User({
		name : data.name,
		mobile : data.mobile,
		email : data.email,
		created_at : new Date()
	})

	user.reviews.push(data.reviews);

	user.save(function(err){
		if(err) throw err;
		res.send(user.name + "submitted a feedback");
	})

	// var dataObj = JSON.parse(data);

	// console.log(dataObj);

	// console.log("checking mongo");

	// create a new user called chris
// var chris = new User({
//   name: 'Chris',
//   username: 'sevilayha',
//   password: 'password' 
// });

// call the custom method. this will just add -dude to his name
// user will now be Chris-dude
// chris.dudify(function(err, name) {
//   if (err) throw err;

//   console.log('Your new name is ' + name);
// });

// call the built-in save method to save to the database
// chris.save(function(err) {
//   if (err) throw err;

//   console.log('User saved successfully!');
//   res.send("saved user");
// });

})