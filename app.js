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

let seatsMap = {
   "s1": {
      class: "seat",
      id: "s1",
      third: false
   },
   "s2": {
      class: "seat",
      id: "s2",
      third: false
   },
   "s3": {
      class: "seat booked",
      id: "s3",
      third: true
   },
   "s4": {
      class: "seat booked",
      id: "s4",
      third: false
   },
   "s5": {
      class: "seat booked",
      id: "s5",
      third: false
   },
   "s6": {
      class: "seat",
      id: "s6",
      third: true
   },
   "s7": {
      class: "seat booked",
      id: "s7",
      third: false
   },
   "s8": {
      class: "seat",
      id: "s8",
      third: false
   },
   "s9": {
      class: "seat",
      id: "s9",
      third: true
   },
   "s10": {
      class: "seat",
      id: "s10",
      third: false
   },
   "s11": {
      class: "seat booked",
      id: "s11",
      third: false
   },
   "s12": {
      class: "seat",
      id: "s12",
      third: true
   },
   "s13": {
      class: "seat booked",
      id: "s13",
      third: false
   },
   "s14": {
      class: "s booked",
      id: "s14",
      third: false
   },
   "s15": {
      class: "s",
      id: "s15",
      third: true
   },
   "s16": {
      class: "s",
      id: "s16",
      third: false
   },
   "s17": {
      class: "s",
      id: "s17",
      third: false
   },
   "s18": {
      class: "s booked",
      id: "s18",
      third: true
   },
   "s19": {
      class: "s booked",
      id: "s19",
      third: false
   },
   "s20": {
      class: "s",
      id: "s20",
      third: false
   },
   "s21": {
      class: "s",
      id: "s21",
      third: true
   },
   "s22": {
      class: "s",
      id: "s22",
      third: false
   },
   "s23": {
      class: "s",
      id: "s23",
      third: false
   },
   "s24": {
      class: "s booked",
      id: "s24",
      third: true
   },
   "s25": {
      class: "s booked",
      id: "s25",
      third: false
   },
   "s26": {
      class: "s booked",
      id: "s26",
      third: false
   },
   "s27": {
      class: "s booked",
      id: "s27",
      third: true
   },
   "s28": {
      class: "s booked",
      id: "s28",
      third: false
   },
   "s29": {
      class: "s",
      id: "s29",
      third: false
   },
   "s30": {
      class: "s",
      id: "s30",
      third: true
   },
   "s31": {
      class: "s",
      id: "s31",
      third: false
   },
   "s32": {
      class: "s",
      id: "s32",
      third: false
   },
   "s33": {
      class: "s",
      id: "s33",
      third: true
   },
   "s34": {
      class: "s",
      id: "s34",
      third: false
   },
   "s35": {
      class: "s",
      id: "s35",
      third: false
   },
   "s36": {
      class: "s",
      id: "s36",
      third: true
   },
   "s37": {
      class: "s booked",
      id: "s37",
      third: false
   },
   "s38": {
      class: "s booked",
      id: "s38",
      third: false
   },
   "s39": {
      class: "s",
      id: "s39",
      third: true
   },
   "s40": {
      class: "s",
      id: "s40",
      third: false
   },
   "s41": {
      class: "s",
      id: "s41",
      third: false
   },
   "s42": {
      class: "s",
      id: "s42",
      third: true
   },
   "s43": {
      class: "s booked",
      id: "s43",
      third: false
   },
   "s44": {
      class: "s booked",
      id: "s44",
      third: false
   },
   "s45": {
      class: "s",
      id: "s45",
      third: true
    }
};

handlebars.registerHelper( 'eachInMap', function ( map, block ) {
   var out = '';
   Object.keys( map ).map(function( prop ) {
      out += block.fn( {key: prop, value: map[ prop ]} );
   });
   return out;
} );

server.listen(port);