//Authors: Luke Regalado, Miguel Guerrero, Ilan Templa.

//Initials
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const server = express();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

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

   const hashedPassword = await bcrypt.hash(userPassword, 10); //hash pw

   // create new doc
   const newUser = new userList({
      name: username,
      password: hashedPassword,
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

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
         // if password is incorrect
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
   userList.findOne({}).lean()
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
async function renderProfilePage(req, res, suggestions, userInfo) {
   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;

   const userReservations = await filterReservationByName(userInfo.name);
   
   console.log("Rendering profile page...");

   if (loggedInUser && loggedInUser === userInfo.email) {
      // render the profile page with the delete button visible
      res.render('profile', { 
         layout: 'index',
         loggedin: loggedin,
         reservations: userReservations,
         suggestions: null,
         userData: userInfo,
         owner: true});
   } else {
      // render the profile page without the delete button
      res.render('profile', { 
         layout: 'index',
         loggedin: loggedin,
         reservations: userReservations,
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

//helper function for profile reservations
async function filterReservationByName(name) {
   try {
      const regex = new RegExp(name, 'i'); 

      const filteredReservations = await seatModel.find({
         Reservee: { $regex: regex } //search db with Reservee: name
     }).select('Room Slot').lean(); //select necessary fields to display

      return filteredReservations;
   } catch (error) {
      console.error('Error filtering reservations by name:', error);
      throw error;
   }
}

const seatSchema = new mongoose.Schema({
   Slot: String,
   Availability: Boolean,
   Room: String,
   ID: Number,
   Reservee: String,
   DateTimeReq: String,
   DateTimeRes: String,
   BR: Boolean
});

//Model Definition
const seatModel = mongoose.model("reservations", seatSchema)


server.get('/vsa', async function(req, res){
   mongoose.connection.collection('reservations')
   .find()
   .toArray()
   .then(seats => {
      const seatArray = seats.flatMap(reservation => {
         return Object.keys(reservation).map(key => {
            if (key !== '_id') {
               return {
                  id: reservation[key].id,
                  availability: reservation[key].availability,
                  room: reservation[key].room,
                  Reservee: reservation[key].Reservee,
                  br: reservation[key].br
               };
            }
         });
      }).filter(reservation => reservation);

      console.log(seatArray);

      res.render('vsa', {
         layout: 'index',
         seatArray: seatArray
      });
   })
   .catch(error => {
      console.error(error);
      res.status(500).json({error: 'Couldnt fetch.'});
   })
});

server.get('/vsa/available', async function(req, res){
   mongoose.connection.collection('reservations')
   .find()
   .toArray()
   .then(seats => {
      const seatArray = seats.flatMap(reservation => {
         return Object.keys(reservation).map(key => {
            if (key !== '_id' && reservation[key].availability === true) {
               return {
                  id: reservation[key].id,
                  availability: reservation[key].availability,
                  room: reservation[key].room,
                  Reservee: reservation[key].Reservee,
                  br: reservation[key].br
               };
            }
         });
      }).filter(reservation => reservation);

      console.log(seatArray);

      res.render('vsa', {
         layout: 'index',
         seatArray: seatArray
      });
   })
   .catch(error => {
      console.error(error);
      res.status(500).json({error: 'Couldnt fetch.'});
   })
});


server.get('/reserveslot', async function(req, res){
      const seatReservations = await seatModel.find({}).lean()
      res.render('reserveslot', {
         layout: 'index',
         seatArray: seatReservations
      });

});

server.get('/seereservation', async function(req, res){
   const loggedInUser = req.cookies.user;
   const seatReservations = await seatModel.find({Reservee: loggedInUser}).lean()
   res.render('seereservation', {layout : 'index', reservations : seatReservations});
});

server.post('/reserve', async (req, res) => {
   try {
      const slotAvailability = req.body.Availability;
      const slot = req.body.Slot;
      const loggedInUser = req.cookies.user;
      const currentdate = new Date(); 
      switch(currentdate.getDate()){
         case 1:
         case 2:
         case 3:
         case 4:
         case 5:
         case 6:
         case 7:
         case 8:
         case 9:
            datetime = "0" + currentdate.getDate() + "/";
            break;
         default:
            datetime = currentdate.getDate() + "/";
      }

      switch(currentdate.getMonth() + 1){
         case 1:
         case 2:
         case 3:
         case 4:
         case 5:
         case 6:
         case 7:
         case 8:
         case 9:
            datetime += "0" + (currentdate.getMonth()+1) + "/" + currentdate.getFullYear() + " ";
            break;
         default:
            datetime += (currentdate.getMonth()+1) + "/" + currentdate.getFullYear() + " ";
      }

      switch(currentdate.getMinutes()){
         case 0:
         case 1:
         case 2:
         case 3:
         case 4:
         case 5:
         case 6:
         case 7:
         case 8:
         case 9:
            datetime += currentdate.getHours() + ":" + "0" + currentdate.getMinutes();
            break;
         default:
            datetime += currentdate.getHours() + ":" + currentdate.getMinutes();
      }
      console.log(slot);
      console.log(loggedInUser);
      console.log(datetime);

      const reservedSlot = await seatModel.findOneAndUpdate(
         { Slot: slot }, // find by slot id
         { Availability: slotAvailability, Reservee: loggedInUser, DateTimeReq: datetime, DateTimeRes: "05/10/2024 9:15 - 10:45"}, // update username and desc
         { new: true } // return updated document
      );
   } catch (error) {
      console.error('Error reserving:', error);
      res.status(500).send('An error occurred while editing user profile');
   }
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


let reservationsOnPage = [
   {seatNum: "22", lab: "GK304B", dateAndTimeReq: "02/12/2023 09:14", dateAndTimeRes: "02/15/2023 14:30"},
   {seatNum: "37", lab: "GK301A", dateAndTimeReq: "02/16/2023 06:01", dateAndTimeRes: "02/29/2023 11:00"},
   {seatNum: "02", lab: "GK304A", dateAndTimeReq: "02/13/2023 20:43	", dateAndTimeRes: "02/15/2023 09:15"}
]

server.listen(port);