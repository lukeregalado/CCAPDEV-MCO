//Authors: Luke Regalado, Miguel Guerrero, Ilan Templa.

//Initials
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const server = express();
const multer = require('multer');
const path = require('path');

const port = process.env.port | 3000;


const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(cookieParser());
server.use(express.urlencoded({ extended: true}));

const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
   extname: 'hbs'
}));

server.use(express.static(path.join(__dirname, 'public')));


/*
<================ multer (file uploads) ================>
*/
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
       // dir where files will be saved
       cb(null, 'public/images/uploads/'); 
   },
   filename: function (req, file, cb) {
       // filename
       cb(null, file.originalname); 
   }
});

const upload = multer({ storage: storage });

server.post('/uploadProfilePicture', upload.single('photo'), async (req, res) => {
   console.log(req.file.path)
   const pfpURL = req.file.path.replace(/\\/g, '/').replace('public', ''); //reverses all slashes
   const userEmail = req.body.email;

   const updateUserPicture = await userList.findOneAndUpdate(
      { email: userEmail }, //find by email
      { pfpURL: pfpURL }, //update url
      { new: true } //return updated document
   ).lean();

   res.sendStatus(200); 
});

// server.post('/edit-profile', async (req, res) => {
//    try {
//       const userEmail = req.body.email;
//       const username = req.body.name;
//       const userDesc = req.body.description;

//       const updatedUser = await userList.findOneAndUpdate(
//          { email: userEmail }, // find by email
//          { name: username, description: userDesc }, // update username and desc
//          { new: true } // return updated document
//       );

//       if (updatedUser) {
//          console.log(`User with email ${userEmail} edited successfully.`);
//          res.status(200).send('Profile edited successfully');
//       } else {
//          console.log(`User with email ${userEmail} not found.`);
//          res.status(404).send('User not found');
//       }
//    } catch (error) {
//       console.error('Error editing user profile:', error);
//       res.status(500).send('An error occurred while editing user profile');
//    }
// });


/*
<================ MONGODB ================>
*/
mongoose.connect('mongodb://localhost:27017/MCOdb')
const userSchema = new mongoose.Schema({
   name: String,
   password: String,
   pos: String,
   pfpURL: String,
   email: String,
   description: String
})

const userList = mongoose.model("users", userSchema)

/*
<================ MAIN CODE ================>
*/
server.get('/', function(req, res){
    res.render('main', {layout : 'index'});
 
});

// register user
server.post('/register', async (req, res) => {
  try {
   const username = req.body.email;
   const userPassword = req.body.password;
   const userPosition = req.body.pos;

   // check if user is already existing
   const existingUser = await userList.findOne({ email: username });
   if (existingUser) {
      console.log(`User with email ${username} already exists!`);
      return res.status(400).send('User already exists!');
   }

   // create new doc
   const newUser = new userList({
      name: username,
      password: userPassword,
      pos: userPosition,
      pfpURL: "/images/sample-users/Name",
      email: username,
      description: "This user hasn't added a description yet."
   });

   // add and save the new user document to the database
   await newUser.save();

   console.log('User registered successfully:', newUser);
   res.status(200).send('Profile registered successfully');
} catch (error) {
   console.error('Error registering user:', error);
   res.status(500).send('An error occurred while registering user');
}
});

server.post('/login', async (req, res) => {
   try {
      const { email, password, remember } = req.body;

      // check if user with email exists
      const user = await userList.findOne({ email: email });

      if (!user) {
         // if not found
         return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (password !== user.password) {
         // if pw is incorrect
         return res.status(401).json({ error: 'Invalid email or password' });
      }

      const cookieOptions = {
         httpOnly: true
      };

      // if remember me is checked
      if (remember) {
         res.cookie('user', user.email, { httpOnly: true, expires: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)});
      } else {
         res.cookie('user', user.email, { httpOnly: true });
      }

      
      // if email + pw match, respond w success
      res.status(200).json({ name: user.name });

   } catch (error) {
       // err
       console.error('Error during login:', error);
       res.status(500).json({ error: 'An error occurred during login' });
   }
});

server.post('/logout', async (req, res) => {
   try {
      // clear all cookies with the name "user"
      res.clearCookie('user');

      // respond with success
      res.status(200).json({ message: 'Logged out successfully' });

   } catch (error) {
       // err
       console.error('Error during logout:', error);
       res.status(500).json({ error: 'An error occurred during logout' });
   }
});

/*
<================ PROFILE ================>
*/
server.get('/profile', function(req, res) {
   userList.findOne({email: "im_nayeon@dlsu.edu.ph"}).lean()
   .then(function (user) {
      renderProfilePage(req, res, null, user);
   })
   .catch(function (err) {
      console.log(err)
   })
});

// search user
server.get('/profile/:username', (req, res) => {
   const username = req.params.username;
   const loggedInUser = req.cookies.user;
   const loginBool = loggedInUser !== null;
   
   console.log('Redirecting to ', username, '\'s profile...');
   
   const regex = RegExp(username, 'i');

   // get user data given email
   userList.findOne({name: { $regex: regex }}).lean()
   .then(function (user) {
      renderProfilePage(req, res, null, user)
   })
   .catch(function (err) {
      res.status(404).send('User not found');
      console.log(err)
   })
});

server.post('/search', async (req, res) => {
   try {
       const inputData = req.body.data;
       console.log('Received live search input:', inputData);

       const searchSuggestions = await filterUserData(inputData);
       
       res.status(200).json(searchSuggestions);
   } catch (error) {
       console.error('Error processing search request:', error);
       res.status(500).json({ error: 'An error occurred while processing the search request' });
   }
});


// edit user
server.post('/edit-profile', async (req, res) => {
   try {
      const userEmail = req.body.email;
      const username = req.body.name;
      const userDesc = req.body.description;

      const updatedUser = await userList.findOneAndUpdate(
         { email: userEmail }, // find by email
         { name: username, description: userDesc }, // update username and desc
         { new: true } // return updated document
      );

      if (updatedUser) {
         console.log(`User with email ${userEmail} edited successfully.`);
         res.status(200).send('Profile edited successfully');
      } else {
         console.log(`User with email ${userEmail} not found.`);
         res.status(404).send('User not found');
      }
   } catch (error) {
      console.error('Error editing user profile:', error);
      res.status(500).send('An error occurred while editing user profile');
   }
});



// delete user
server.post('/delete-profile', async (req, res) => {
   try {
      const userEmail = req.body.email;
      const regex = RegExp(userEmail, 'i');
      const user = await userList.findOneAndDelete({ email: userEmail });

      if (user) {
         console.log(`User with email ${userEmail} deleted successfully.`);
         res.status(200).send('Profile deleted successfully');
      } else {
         console.log(`User with email ${userEmail} not found.`);
         res.status(404).send('User not found');
      }
   } catch (error) {
      console.error('Error deleting user profile:', error);
      res.status(500).send('An error occurred while deleting user profile');
   }
});

// helper function for rendering profile page
function renderProfilePage(req, res, suggestions, userInfo) {
   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;
   
   console.log("Rendering profile page...");

   if (loggedInUser && loggedInUser === userInfo.email) {
      // render the profile page with the delete button visible
      res.render('profile', { 
         layout: 'index',
         loggedin: loggedin,
         reservations: reservations,
         suggestions: null,
         userData: userInfo,
         owner: true});
   } else {
      // render the profile page without the delete button
      res.render('profile', { 
         layout: 'index',
         loggedin: loggedin,
         reservations: reservations,
         suggestions: null,
         userData: userInfo ,
         owner: false});
   }
}

// helper function for user search
async function filterUserData(inputString) {
   try {
       const regex = new RegExp(inputString, 'i'); 
       const filteredUsers = await userList.find({
           name: { $regex: regex } //search for db with name: userInput
       }).select('name pfpURL email'); //select necessary fields to display
       return filteredUsers;
   } catch (error) {
       console.error('Error filtering user data:', error);
       throw error; //err
   }
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