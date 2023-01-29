require('dotenv').config({
  path: 'prod.env'
});
const PORT = process.env.PORT || 3000;
const express = require('express');
const Twitter = require('twit');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const envVar = process.env;
const username = envVar.TWITTER_USERNAME;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: envVar.EMAIL_ID,
    pass: envVar.EMAIL_PASSWORD
  }
});

const client = new Twitter({
  consumer_key: envVar.TWITTER_CONSUMER_KEY,
  consumer_secret: envVar.TWITTER_CONSUMER_SECRET,
  access_token: envVar.TWITTER_ACCESS_TOKEN,
  access_token_secret: envVar.TWITTER_ACCESS_TOKEN_SECRET
});

const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors(corsOpts));
app.use(express.json());
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Email Sender
app.post('/emailsend', function (req, res) {

  let senderName = req.body.name;
  let senderEmail = req.body.email;
  let messageText = req.body.message;

  let mailOptions = {
    to: ['zjoylab@gmail.com'], // Enter here the email address on which you want to send emails from your customers
    from: senderName,
    subject: 'Message from zjoylab.com',
    text: `
      Name: ${senderName}
      Email: ${senderEmail}
      Message: ${messageText}
    `,
    replyTo: senderEmail
  };

  if (senderName === '' || senderEmail === '' || messageText === '') {
    res.status(400);
    res.send({
    message: 'Bad request'
    });
    return;
  }

  transporter.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
      res.send({ error: error });
    } else {
      console.log('Message sent: ', response);
      res.status(200).send({ success: true });
    }
  });
});

// Twitter
app.get('/statuses', (req, res) => {
    const params = { 
    screen_name: username, 
    count: 1,
  };   
  client
    .get(`/statuses/user_timeline`, params)
    .then(timeline => {         
      res.send(timeline);
    })
    .catch(error => {
    res.send(error);
  });      
});

app.listen(PORT, function() {
  console.log(`Listening on Port ${PORT}`);
});