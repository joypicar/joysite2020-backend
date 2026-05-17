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
const axios = require('axios');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: envVar.EMAIL_ID,
    pass: envVar.EMAIL_PASSWORD
  }
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
app.get('/api/tweets', async (req, res) => {
  const BEARER_TOKEN = envVar.TWITTER_BEARER_TOKEN;
  console.log('token', BEARER_TOKEN)
  try {
    const response = await axios.get(
      'https://api.twitter.com/2/users/61741500/tweets',
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
        params: {
          max_results: 5,
          'tweet.fields': 'created_at,text'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('Twitter API error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Twitter API failed',
      message: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, function() {
  console.log(`Listening on Port ${PORT}`);
});