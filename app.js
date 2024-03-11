//Initials
const express = require('express');
const server = express();

const port = process.env.port | 3000;

constbodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true}));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
   extname: 'hbs'
}));

server.use(express.static('public'));
/*
<================ MAIN CODE ================>
*/


server.get('/', function(req, res){
    res.render('main', {layout : 'index'});
 
 });

server.get('/profile', function(req, res){
   res.render('profile', {layout : 'index'});
});

server.get('/vsa', function(req, res){
   res.render('vsa', {layout : 'index'});
});

server.get('/reserveslot', function(req, res){
   res.render('reserveslot', {layout : 'index'});
});


server.get('/seereservation', function(req, res){
   res.render('seereservation', {layout : 'index'});
});



server.listen(port);