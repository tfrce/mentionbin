// web.js
var express = require("express");
var Mustache = require('mustache');
var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
var timeago = require('timeago');
var fs = require("fs");
var _ = require("lodash");
var bodyParser = require('body-parser');
var marked = require("marked");

var app = express();
app.use(express.static(__dirname + '/public', {maxAge: 0 * 1000}));
app.use(bodyParser());



var templates = {
  layout: fs.readFileSync('templates/layout.html', 'utf8'),
  home: fs.readFileSync('templates/home.html', 'utf8'),
  create: fs.readFileSync('templates/create.html', 'utf8'),
  edit: fs.readFileSync('templates/edit.html', 'utf8'),
  about: fs.readFileSync('templates/about.html', 'utf8'),
  privacy: fs.readFileSync('templates/privacy.html', 'utf8'),
  campaign: fs.readFileSync('templates/campaign.html', 'utf8')

}

var generatePage = function (options) {
  var layout = options.layout || templates.layout;
  var title = options.title || 'Mention Bin - Instantly create Twitter campaigns that target US legislators'
  var description = options.page && options.page.description || ''

  var page = {
    data: options.page && options.page.data || {},
    template: options.page && options.page.template || 'No content'
  }
  var pageContent = Mustache.render(page.template, page.data);

  var fullContent = Mustache.render(layout, {title: title, description: description, page: pageContent});
  return fullContent;

}



function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
MongoClient.connect(process.env.MONGOHQ_URL, function(err, db) {
  app.get('/', function(req, res) {
    res.send(generatePage({
      page: {
        template: templates.home
      }
    }));
  });
  app.get('/create', function(req, res) {
    res.send(generatePage({
      page: {
        template: templates.create
      }
    }));
  });
  app.get('/campaign/:public_code/edit', function(req, res) {
    db.collection('campaigns').findOne({"public_code" : req.params.public_code}, function(err, campaign) {
      console.log(arguments);
      if(!campaign) {
        res.send(generatePage({
          page: {template: 'Campaign not found'}
        }));
      } else {
        res.send(generatePage({
          page: {
            template: templates.edit,
            data: campaign
          }
        }));
      }
    });
  });
  app.post('/campaign/:public_code/edit', function(req, res) {
    db.collection('campaigns').findOne({"public_code" : req.params.public_code, "password": req.body.password}, function(err, campaign) {
      console.log(arguments);
      if(!campaign) {
        res.send({status: "Invalid Password"});
      } else {
        db.collection('campaigns').update({public_code: req.params.public_code}, {$set: {title:req.body.title, description:req.body.description, tweet_text: req.body.tweet}}, function(err, document){

          res.redirect('/campaign/' + req.params.public_code);
        });
      }
    });
  });
  app.post('/create', function(req, res){
    var public_code = S4() + S4();
    var document = {
      description: req.body.description,
      title: req.body.title,
      tweet_text: req.body.tweet,
      password: req.body.password,
      public_code: public_code,
      tweets: 0
    };
    db.collection('campaigns').insert(document, {safe: true}, function(err, records){
      res.redirect('/campaign/' + public_code);
    });
  });
  app.get('/about', function(req, res) {
    res.send(generatePage({
      page: {
        template: templates.about
      }
    }));
  });
  app.get('/privacy', function(req, res) {
    res.send(generatePage({
      page: {
        template: templates.privacy
      }
    }));
  });
  app.get('/campaign/:public_code', function(req, res) {
    db.collection('campaigns').findOne({"public_code" : req.params.public_code}, function(err, campaign) {
      console.log(arguments);
      if(!campaign) {
        res.send(generatePage({
          page: {template: 'Campaign not found'}
        }));
      } else {
        campaign.description = marked(campaign.description);
        res.send(generatePage({
          page: {
            template: templates.campaign,
            data: campaign
          }
        }));
      }
    });

  });
  app.get('/tweeted/:public_code', function(req, res) {
    db.collection('campaigns').update( { public_code: req.params.public_code }, { $inc: { tweets: 1 } }, function () {

      console.log(arguments);
    });
    res.send({message: 'logged'});
  });
  var port = Number(process.env.PORT || 5000);
  app.listen(port, function() {
    console.log("Listening on " + port);
  });
});
