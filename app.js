//Authors: Luke Regalado, Miguel Guerrero, Ilan Templa.

//Initials
const express = require('express');
const server = express();
const path = require('path');

const port = process.env.port | 3000;

const bodyParser = require('body-parser');
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
      console.log('add', userData);
      res.status(200).send('Profile registered successfully'); 
  }
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
   res.render('vsa', {
      layout : 'index',
      seatsMap: seatsMap});
   console.log(seatsMap);
});

server.get('/reserveslot', function(req, res){
   res.render('reserveslot', {layout : 'index', seatsMap : seatsMap});
});

server.get('/seereservation', function(req, res){
   res.render('seereservation', {layout : 'index', reservations : reservationsOnPage});
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
      password: "1234",
      pos: "student",
      pfpURL: "/images/sample-users/Im Na-yeon",
      email: "im_nayeon@dlsu.edu.ph",
      description: "Student at DLSU University. Lead vocalist of TWICE."
   },
   "yoo_jeongyeon@dlsu.edu.ph": {
      name: "Yoo Jeong-yeon",
      password: "1234",
      pos: "student",
      pfpURL: "/images/sample-users/Yoo Jeong-yeon",
      email: "yoo_jeongyeon@dlsu.edu.ph",
      description: "Lab Technician at a certain DLSU Lab. Main vocalist of TWICE."
   },
   "hirai_momo@dlsu.edu.ph": {
      name: "Hirai Momo",
      password: "1234",
      pos: "student",
      pfpURL: "/images/sample-users/Hirai Momo",
      email: "hirai_momo@dlsu.edu.ph",
      description: "Lab Technician at a certain DLSU Lab. Main dancer of TWICE."
   },
   "minatozaki_sana@dlsu.edu.ph": {
      name: "Minatozaki Sana",
      password: "1234",
      pos: "student",
      pfpURL: "/images/sample-users/Minatozaki Sana",
      email: "minatozaki_sana@dlsu.edu.ph",
      description: "Lab Technician at a certain DLSU Lab. Lead vocalist of TWICE."
   },
   "park_jihyo@dlsu.edu.ph": {
      name: "Park Ji-hyo",
      password: "1234",
      pos: "tech",
      pfpURL: "/images/sample-users/Park Ji-hyo",
      email: "park_jihyo@dlsu.edu.ph",
      description: "Student at DLSU University. Main vocalist and leader of TWICE."
   }
};

let seatsMap = {
   "s1": {
      class: "seat",
      id: "s1",
      br: false
   },
   "s2": {
      class: "seat",
      id: "s2",
      br: false
   },
   "s3": {
      class: "seat booked",
      id: "s3",
      br: true
   },
   "s4": {
      class: "seat booked",
      id: "s4",
      br: false
   },
   "s5": {
      class: "seat booked",
      id: "s5",
      br: false
   },
   "s6": {
      class: "seat",
      id: "s6",
      br: true
   },
   "s7": {
      class: "seat booked",
      id: "s7",
      br: false
   },
   "s8": {
      class: "seat",
      id: "s8",
      br: false
   },
   "s9": {
      class: "seat",
      id: "s9",
      br: false
   },
   "s10": {
      class: "seat",
      id: "s10",
      br: false
   },
   "s11": {
      class: "seat booked",
      id: "s11",
      br: false
   },
   "s12": {
      class: "seat",
      id: "s12",
      br: true
   },
   "s13": {
      class: "seat booked",
      id: "s13",
      br: false
   },
   "s14": {
      class: "seat booked",
      id: "s14",
      br: false
   },
   "s15": {
      class: "seat",
      id: "s15",
      br: true
   },
   "s16": {
      class: "seat",
      id: "s16",
      br: false
   },
   "s17": {
      class: "seat",
      id: "s17",
      br: false
   },
   "s18": {
      class: "seat booked",
      id: "s18",
      br: false
   },
   "s19": {
      class: "seat booked",
      id: "s19",
      br: false
   },
   "s20": {
      class: "seat",
      id: "s20",
      br: false
   },
   "s21": {
      class: "seat",
      id: "s21",
      br: true
   },
   "s22": {
      class: "seat",
      id: "s22",
      br: false
   },
   "s23": {
      class: "seat",
      id: "s23",
      br: false
   },
   "s24": {
      class: "seat booked",
      id: "s24",
      br: true
   },
   "s25": {
      class: "seat booked",
      id: "s25",
      br: false
   },
   "s26": {
      class: "seat booked",
      id: "s26",
      br: false
   },
   "s27": {
      class: "seat booked",
      id: "s27",
      br: false
   },
   "s28": {
      class: "seat booked",
      id: "s28",
      br: false
   },
   "s29": {
      class: "seat",
      id: "s29",
      br: false
   },
   "s30": {
      class: "seat",
      id: "s30",
      br: true
   },
   "s31": {
      class: "seat",
      id: "s31",
      br: false
   },
   "s32": {
      class: "seat",
      id: "s32",
      br: false
   },
   "s33": {
      class: "seat",
      id: "s33",
      br: true
   },
   "s34": {
      class: "seat",
      id: "s34",
      br: false
   },
   "s35": {
      class: "seat",
      id: "s35",
      br: false
   },
   "s36": {
      class: "seat",
      id: "s36",
      br: false
   },
   "s37": {
      class: "seat booked",
      id: "s37",
      br: false
   },
   "s38": {
      class: "seat booked",
      id: "s38",
      br: false
   },
   "s39": {
      class: "seat",
      id: "s39",
      br: true
   },
   "s40": {
      class: "seat",
      id: "s40",
      br: false
   },
   "s41": {
      class: "seat",
      id: "s41",
      br: false
   },
   "s42": {
      class: "seat",
      id: "s42",
      br: true
   },
   "s43": {
      class: "seat booked",
      id: "s43",
      br: false
   },
   "s44": {
      class: "seat booked",
      id: "s44",
      br: false
   },
   "s45": {
      class: "seat",
      id: "s45",
      br: false
    }
};

let reservationsOnPage = [
   {seatNum: "22", lab: "GK304B", dateAndTimeReq: "02/12/2023 09:14", dateAndTimeRes: "02/15/2023 14:30"},
   {seatNum: "37", lab: "GK301A", dateAndTimeReq: "02/16/2023 06:01", dateAndTimeRes: "02/29/2023 11:00"},
   {seatNum: "02", lab: "GK304A", dateAndTimeReq: "02/13/2023 20:43	", dateAndTimeRes: "02/15/2023 09:15"}
]

server.listen(port);