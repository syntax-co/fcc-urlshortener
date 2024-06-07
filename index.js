require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns')
const mongoose = require('mongoose')


const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@fcc-mongoose.btvpglg.mongodb.net/?retryWrites=true&w=majority&appName=fcc-mongoose`

mongoose.connect(uri)



const _schema = {
  ident: String,
  realUrl: String
}

const shorturlSchema = new mongoose.Schema(_schema)

const Shorturl = mongoose.model('Shorturl',shorturlSchema)




function randDent() {
  const size = 16

  const _chars = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '-', '_', '.', '~'
  ]

  var ident = ''


  for (var i=0; i<size; i++) {
    ident+=_chars[Math.floor(Math.random()*_chars.length)]
  }

  return ident;

}

function isValidURL(str) {
  const regex = /^(https?:\/\/)?((([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})|(localhost))(:\d{2,5})?(\/[^\s]*)?$/;
  return regex.test(str);
}



// Basic Configuration
const port = process.env.PORT || 3000;



app.use(bodyParser.urlencoded({extended:false}))
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});





app.get('/api/shorturl/:shorturl', async(req,res) => {

  const param = req.params

  

  const result = await Shorturl.find({
    ident:param.shorturl
  }).exec()


  

  if (result.length>0) {
    
    if (!isValidURL(result[0].realUrl)) {
      res.json({
        error:'invalid url'
      })
    }

  
    console.log(result[0].realUrl)
    res.redirect(result[0].realUrl)
  } else{
    console.log('hit')
  }
  
  


})



app.post('/api/shorturl',async(req,res) => {

  const body = req.body
  const test = dns.lookup(body.url,(err,data) => {})
  var ident = randDent()
  var unique = false
  

  if (!isValidURL(body.url)) {
    res.json({
      error:'invalid url'
    })
  }


  while (!unique) {
    var results = await Shorturl.find({ident:ident}).exec()
    
    if (results.length<=0) {
      ident=randDent()
      unique=true
    } else {
      ident=randDent()
    }
  }

  



  const shortUrl = new Shorturl({
    ident:ident,
    realUrl:body.url
  })


  shortUrl.save()
  
  const final = {
    original_url:body.url,
    short_url:ident
  }

  res.json(final)
})







app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

