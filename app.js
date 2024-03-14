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

// register user
server.post('/register', (req, res) => {
   const username = req.body.email;
   const userPassword = req.body.password;
   const userPosition = req.body.pos;

   if (userData[username]) {
      console.log(`User with email ${username} already exists!.`);
      res.status(400).send('User already exists!');
  } else {
      userData[username] = {
         name: username,
         password: userPassword,
         pos: userPosition,
         pfpURL: "/images/sample-users/Name",
         email: username,
         description: "This user hasn't added a description yet."
      }
  }
   console.log('add', userData);
   res.status(200).send('Profile registered successfully');
});


/*
<================ PROFILE ================>
*/
server.get('/profile', function(req, res) {
   renderProfilePage(res, null, userData["im_nayeon@dlsu.edu.ph"]);
});


// search user
server.get('/profile/:username', (req, res) => {
   const username = req.params.username;
   // get user data given email
   const userInfo = userData[findUserEmailByName(username)]; 
   
   console.log('Redirecting to ', username, '\'s profile...');
   
   if (userInfo) {
      // render the profile page with userData
      renderProfilePage(res, null, userInfo);
   } else {
      // handle error
      res.status(404).send('User not found');
   }
});

// edit user
server.post('/edit-profile', (req, res) => {
   const userEmail = req.body.email;
   const username = req.body.name;
   const userDesc = req.body.description;
   if (userData[userEmail]) {
      userData[userEmail].name = username;
      userData[userEmail].description = userDesc;
      console.log(`User with email ${userEmail} edited successfully.`);
  } else {
      console.log(`User with email ${userEmail} not found.`);
  }
   res.status(200).send('Profile edited successfully');
});

server.post('/search', (req, res) => {
   const inputData = req.body.data;
   console.log('Received live search input:', inputData);

   const searchSuggestions = filterUserData(inputData);
 
   res.status(200).json(searchSuggestions);
});

// delete user
server.post('/delete-profile', (req, res) => {
   const userEmail = req.body.email;
   if (userData[userEmail]) {
      // delete the user from the userData object
      delete userData[userEmail];
      console.log(`User with email ${userEmail} deleted successfully.`);
  } else {
      console.log(`User with email ${userEmail} not found.`);
  }
   res.status(200).send('Profile deleted successfully');
});

server.post('/search', (req, res) => {
   const inputData = req.body.data;
   console.log('Received live search input:', inputData);

   const searchSuggestions = filterUserData(inputData);
 
   res.status(200).json(searchSuggestions);
});


// helper function for searching userData given name
function findUserEmailByName(name) {
   for (const [email, userInfo] of Object.entries(userData)) {
       if (userInfo.name === name) {
           return email; // return email
       }
   }
   // if no match
   return null;
}

// helper function for rendering profile page
function renderProfilePage(res, suggestions, userInfo) {
   res.render('profile', {
       layout: 'index',
       reservations: reservations,
       userData: userInfo,
       suggestions: suggestions
   });
}

// helper function for user search
function filterUserData(inputString) {
   const filteredUsers = [];
   for (const [key, value] of Object.entries(userData)) {
       if (value.name.toLowerCase().includes(inputString.toLowerCase())) {
            filteredUsers.push({ name: value.name, pfpURL: value.pfpURL, email: value.email });
        };
   }
   return filteredUsers;
}

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
   // "im_nayeon@dlsu.edu.ph": {
   //    name: "Im Na-yeon",
   //    password: "1234",
   //    pos: "student",
   //    pfpURL: "/images/sample-users/Im Na-yeon",
   //    email: "im_nayeon@dlsu.edu.ph",
   //    description: "Student at DLSU University. Lead vocalist of TWICE."
   // },
   // "yoo_jeongyeon@dlsu.edu.ph": {
   //    name: "Yoo Jeong-yeon",
   //    password: "1234",
   //    pos: "student",
   //    pfpURL: "/images/sample-users/Yoo Jeong-yeon",
   //    email: "yoo_jeongyeon@dlsu.edu.ph",
   //    description: "Lab Technician at a certain DLSU Lab. Main vocalist of TWICE."
   // },
   // "hirai_momo@dlsu.edu.ph": {
   //    name: "Hirai Momo",
   //    password: "1234",
   //    pos: "student",
   //    pfpURL: "/images/sample-users/Hirai Momo",
   //    email: "hirai_momo@dlsu.edu.ph",
   //    description: "Lab Technician at a certain DLSU Lab. Main dancer of TWICE."
   // },
   // "minatozaki_sana@dlsu.edu.ph": {
   //    name: "Minatozaki Sana",
   //    password: "1234",
   //    pos: "student",
   //    pfpURL: "/images/sample-users/Minatozaki Sana",
   //    email: "minatozaki_sana@dlsu.edu.ph",
   //    description: "Lab Technician at a certain DLSU Lab. Lead vocalist of TWICE."
   // },
   // "park_jihyo@dlsu.edu.ph": {
   //    name: "Park Ji-hyo",
   //    password: "1234",
   //    pos: "tech",
   //    pfpURL: "/images/sample-users/Park Ji-hyo",
   //    email: "park_jihyo@dlsu.edu.ph",
   //    description: "Student at DLSU University. Main vocalist and leader of TWICE."
   // }
};

server.listen(port);