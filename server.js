var express = require('express');
var app = express();
var mongoose = require('mongoose');
var fs = require('fs');
var csv = require('fast-csv');


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var xoauth2 = require('xoauth2');

mongoose.connect('mongodb://localhost/tima');

var nodemailer = require('nodemailer');
// var transporter = nodemailer.createTransport('smtps://amitnirwal80%40gmail.com:Amitnirwal%401@smtp.gmail.com');

// login
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            user: 'MailerAmit0@gmail.com',
            clientId: '56525319787-9r4r3i07ul08sdupcesdqe06mo4ns5iv.apps.googleusercontent.com',
            clientSecret: 'SSSpVfAqe_73lW2dU-PZSeIT',
            refreshToken: '1/I3v6OkL5bkdbhWM3v0wqbm2xtHBre9k1mRIJwyy_D28--ounMQwSeAewRnc_15RM'
        })
    }
});

var CronJob = require('cron').CronJob;



var mailOptions = {
    from: '"Amit" <MailerAmit0@gmail.com>', // sender address
    to: 'amit.k@oodlestechnologies.com,kartik.tickoo@oodlestechnologies.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>', // html body
    attachments: []
        // attachments: [{
        //     path: '../a.pdf',
        //     contentType: 'application/pdf'
        // }]
};

var job = new CronJob('* * * * * *', function() {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });

    }, function() {

        console.log("job ends");

    },
    false, "Asia/Kolkata"
);

// job.start();

const bodyParser = require('body-parser');

app.use(bodyParser.json());


// if our user.js file is at app/models/user.js
var User = require('./models/User');

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

// app.get("/check",function(req,res){
// 	res.send("a");
// 	res.send("b");
// })

app.get('/users', function(req, res) {
    // get all the users
    User.find({}, function(err, users) {
        if (err) throw err;

        var date = new Date();

        var fileName = date.toString().slice(0, 15);



        var csvStream = csv.createWriteStream({ headers: true }),
            writableStream = fs.createWriteStream("../" + fileName + ".csv");

        writableStream.on("finish", function() {
            mailOptions.attachments.push({ path: "../" + fileName + ".csv" });
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            res.send("generated csv");
        });

        csvStream.pipe(writableStream);
        for (var i = 0; i < users.length; i++) {
            csvStream.write({ NAME: users[i].name, "E-MAIL": users[i].email, PHONE: users[i].mobile, REVIEW: users[i].reviews[0].calculator + " - " + users[i].reviews[0].feedback });
        }
        csvStream.end();
    });

});


app.post("/mongo", function(req, res) {

    var resObj = {
        saved: false,
        updated: false,
        error: false
    }

    var data = req.body;

    console.log(data);

    var user = new User({
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        created_at: new Date()
    })

    user.reviews.push(data.reviews);

    User.find({ mobile: data.mobile }, function(err, users) {
        if (err) {
        	console.log("error in search");
            resObj.error = true;
            res.json(JSON.stringify(resObj));
        } else {
            if (users.length !== 0) {
            	console.log("user found")
                users[0].updated_at = new Date();
                console.log("feedback",data.reviews.feedback);
                console.log("prev",users[0].reviews[0].feedback);
                users[0].markModified('reviews');
                users[0].reviews[0].feedback = data.reviews.feedback;
                users[0].save(function(err) {
                    if (err) {
                    	console.log("unable to update");
                        resObj.error = true;
                        res.json(JSON.stringify(resObj));
                    }else{
                    	console.log("updated user");
                    	resObj.updated = true;
                    	res.json(JSON.stringify(resObj));
                    }
                })
            } else {
            	user.save(function(err){
            		if(err){
            			console.log("error saving new user");
            			resObj.error = true;
            			res.json(JSON.stringify(resObj));
            		}else{
            			console.log("user created");
            			resObj.saved = true;
            			res.json(JSON.stringify(resObj));
            		}
            	})
            }
        }

    })

    // user.save(function(err) {
    //     try {
    //         if (err) throw err;
    //     } catch (err) {
    //         resObj.error = true
    //             // res.send("an error occured" + err.type) 
    //         res.json(JSON.stringify(resObj));
    //     }
    //     resObj.saved = true;
    //     res.json(JSON.stringify(resObj));
    //     // res.send(user.name + "submitted a feedback");
    // })

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
