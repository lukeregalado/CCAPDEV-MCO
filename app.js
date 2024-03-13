//Initials
const express = require('express');
const server = express();
const path = require('path');

const port = process.env.port | 3000;

constbodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true}));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
   extname: 'hbs'
}));

server.use(express.static(path.join(__dirname, 'public')));
/*
<================ MAIN CODE ================>
*/


server.get('/', function(req, res){
    res.render('main', {layout : 'index'});
 
 });



server.get('/profile', function(req, res){
   res.render('profile', {layout : 'index', reservations: reservations, userData: userData["im_nayeon@dlsu.edu.ph"] })
});

// for user search
server.get('/userNames', function(req, res) {
   // list names of all users
   const userNames = Object.values(userData).map(user => user.name);

   // send user names to the client-side code
   res.json(userNames);
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

/*
<================ PROFILE PAGE ================>
*/
let reservations = [
   { room: "Room GK101", day: "Monday", time: "10:00 AM - 12:00 PM" },
   { room: "Room GK202", day: "Wednesday", time: "2:00 PM - 4:00 PM" },
   { room: "Room GK302", day: "Wednesday", time: "2:00 PM - 4:00 PM" },
   { room: "Room GK402", day: "Wednesday", time: "2:00 PM - 4:00 PM" },
   { room: "Room GK502", day: "Wednesday", time: "2:00 PM - 4:00 PM" }
];

let userData = {
   "im_nayeon@dlsu.edu.ph": {
       name: "Im Na-yeon",
       pfpURL: "/images/sample-users/Im Na-yeon",
       email: "im_nayeon@dlsu.edu.ph",
       description: "Student at DLSU University. Lead vocalist of TWICE."
   },
   "yoo_jeongyeon@dlsu.edu.ph": {
       name: "Yoo Jeong-yeon",
       pfpURL: "/images/sample-users/Yoo Jeong-yeon",
       email: "yoo_jeongyeon@dlsu.edu.ph",
       description: "Lab Technician at a certain DLSU Lab. Main vocalist of TWICE."
   },
   "hirai_momo@dlsu.edu.ph": {
       name: "Hirai Momo",
       pfpURL: "/images/sample-users/Hirai Momo",
       email: "hirai_momo@dlsu.edu.ph",
       description: "Lab Technician at a certain DLSU Lab. Main dancer of TWICE."
   },
   "minatozaki_sana@dlsu.edu.ph": {
       name: "Minatozaki Sana",
       pfpURL: "/images/sample-users/Minatozaki Sana",
       email: "minatozaki_sana@dlsu.edu.ph",
       description: "Lab Technician at a certain DLSU Lab. Lead vocalist of TWICE."
   },
   "park_jihyo@dlsu.edu.ph": {
       name: "Park Ji-hyo",
       pfpURL: "/images/sample-users/Park Ji-hyo",
       email: "park_jihyo@dlsu.edu.ph",
       description: "Student at DLSU University. Main vocalist and leader of TWICE."
   }
};

server.listen(port);