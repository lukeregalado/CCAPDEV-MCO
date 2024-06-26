//Authors: Luke Regalado, Miguel Guerrero, Ilan Templa.
//Initials
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const server = express();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const { dbURL } = require('./config');

const options = { useNewUrlParser: true,
   useUnifiedTopology: true};
   
mongoose.connect(dbURL, options)


const { envPort, sessionKey } = require('./config');
const port = envPort || 3000;

const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(cookieParser());
server.use(express.urlencoded({ extended: true}));

let store = new MongoStore({
   mongoUrl: dbURL,
   collection: "sessions"
});

server.use(session({
   secret: sessionKey, // secret
   store: store, // store session
   resave: false,
   saveUninitialized: true,
   cookie: { secure: true } // Adjust as needed, set to true if using HTTPS
}));


const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
   extname: 'hbs'
}));

server.use(express.static(path.join(__dirname, 'public')));

/*
<================ MONGODB ================>
*/
// mongoose.connect('mongodb://localhost:27017/MCOdb')
// mongoose.connect('mongodb+srv://lukemregalado:tEtSu1x55FwUqlrh@ccapdev-s16-grp6.ranpse9.mongodb.net/?retryWrites=true&w=majority&appName=MCOdb')
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
         res.cookie('user', user.email, {
            httpOnly: true, 
            expires: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            secure: true,
            sameSite: "none"
         });
      } else {
         res.cookie('user', user.email, { 
            httpOnly: true,
            secure: true,
            sameSite: "none" });
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
   const loggedInUser = req.cookies.user;

   if (loggedInUser !== undefined) {
      // if a user is logged in
      userList.findOne({ 
         email: loggedInUser.trim() 
         }).lean()
         .then(function (user) {
            if (user) {
               // if found, then go to their profile
               res.redirect(`/profile/${user.name}`);
               
            } else {
               renderProfilePage(req, res, null, null);
            }
         })
         .catch(function (err) {
            console.log(err);
            // err
         });
   } else {
      // if no logged in user
      userList.findOne({}).lean()
         .then(function (user) {
            if (user) {
               res.redirect(`/profile/${user.name}`);

            } else {
               // if userlist is empty
               renderProfilePage(req, res, null, null);
            }
         })
         .catch(function (err) {
            console.log(err);
            // err
         });
   }
});


// search user
server.get('/profile/:username', (req, res) => {
   const username = req.params.username;
   const loggedInUser = req.cookies.user;
   
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
   if (!userInfo) {
      // if null, send error
      res.status(404).send("User information not found. Please try again later.");
      return; // return, end function run
   }

   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;

   const userReservations = await filterReservationByName(userInfo.email);
   
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
     }).select('Room Slot DateTimeRes DateTimeReq').lean(); //select necessary fields to display

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
   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;

   res.render('vsa', {
      layout: 'index',
      loggedin: loggedin
   });
   
});

server.get('/vsa/available', async function(req, res){
   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;

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
         seatArray: seatArray,
         loggedin: loggedin
      });
   })
   .catch(error => {
      console.error(error);
      res.status(500).json({error: 'Couldnt fetch.'});
   })
});


server.get('/reserveslot', async function(req, res){
   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;

   var pos;
   await userList.findOne({email: req.cookies.user})
      .then((docs)=>{
      console.log("Result :",docs.pos);
      pos = docs.pos;
      })
      .catch((err)=>{
      console.log(err);
      });;

   const isTech = pos == "tech";
   console.log(isTech);

   const seatReservations = await seatModel.find({}).sort({ID: 1}).lean();
   const users = await userList.find({}).lean();
   if(isTech){
      res.render('reserveslot', {
      layout: 'index',
      seatArray: seatReservations,
      loggedin: loggedin,
      users: users,
      tech: true
      });
   }

   else{
      res.render('reserveslot', {
      layout: 'index',
      seatArray: seatReservations,
      loggedInUser: req.cookies.user,
      loggedin: loggedin,
      tech: false
      });
   }

});

server.get('/editslot', async function(req, res){
   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;

   var pos;
   await userList.findOne({email: req.cookies.user})
      .then((docs)=>{
      pos = docs.pos;
      })
      .catch((err)=>{
      console.log(err);
      });;

   const isTech = pos == "tech";

   const seatReservations = await seatModel.find({}).sort({ID: 1}).lean()
   const users = await userList.find({}).lean();
   if(isTech){
      res.render('editslot', {
      layout: 'index',
      seatArray: seatReservations,
      loggedin: loggedin,
      users: users,
      tech: true
      });
   }

   else{
      res.render('editslot', {
      layout: 'index',
      seatArray: seatReservations,
      loggedInUser: req.cookies.user,
      loggedin: loggedin,
      tech: false
      });
   }

});

server.get('/seereservation', async function(req, res){
   const loggedInUser = req.cookies.user;
   const loggedin = loggedInUser !== undefined;

   const seatReservations = await seatModel.find({Reservee: loggedInUser}).lean()
   res.render('seereservation', {
      layout : 'index', 
      reservations : seatReservations,
      loggedin: loggedin});
});

server.post('/reserve', async (req, res) => {
   try {
      const slotAvailability = req.body.Availability;
      const slot = req.body.Slot;
      const dateOfReservation = req.body.DateTimeRes;
      const currDate = req.body.DateTimeReq;
      const reservee = req.body.reservee;

      const reservedSlot = await seatModel.findOneAndUpdate(
         { Slot: slot }, // find by slot id
         { Availability: slotAvailability, Reservee: reservee, DateTimeReq: currDate, DateTimeRes: dateOfReservation}, // update username and desc
         { new: true } // return updated document
      );
   } catch (error) {
      console.error('Error reserving:', error);
      res.status(500).send('An error occurred while editing user profile');
   }
});

server.post('/filterReservation', async (req, res) => {
   try {
      const slotAvailability = req.body.Availability;
      const date = req.body.Date;
      const time = req.body.Time;
      const room = req.body.Room;

      let dateTimeString;

      if (date) {
         const parts = date.split('-');
         const year = parts[0];
         const month = parts[1];
         const day = parts[2];

         // rearrange date
         const rearrangedDate = `${month}/${day}/${year}`;
         dateTimeString = `${rearrangedDate} ${time}`;
      }
      
      // datetime regex
      const regexDate = new RegExp(dateTimeString, "i"); // "i" flag for case-insensitive search

      // query
      let query = {
         DateTimeRes: { $regex: regexDate },
         Reservee: { $regex: "" },
      };

      // if ()

      
      if (slotAvailability) {
         query.Availability = true;
      }
      if (room != "any") {
         query.Room = room;
      } 
      console.log("QUERY: ", query)
      

      // find
      const filteredReservations = await seatModel.find(query).lean();

      console.log("LIST: ",filteredReservations)

      // return response
      res.status(200).json(filteredReservations);
   } catch (error) {
      console.error('Error filtering reservations:', error);
      res.status(500).json({ error: 'An error occurred while filtering reservations' });
   }
});

server.get('/deleteres', async function(req, res){
   console.log("huh");
   const seatReservations = await seatModel.find({Availability: false}).lean()
   console.log(seatReservations)
   res.render('deleteres', {
      layout: 'index',
      seatReservations: seatReservations
   });
});

server.post('/delete', async (req, res) => {
   try {
      const slotAvailability = req.body.Availability;
      const date = req.body.Date;
      const slot = req.body.Slot;
      const room = req.body.Room;
      const edit = req.body.edit;

      var pos;
      await userList.findOne({email: req.cookies.user})
         .then((docs)=>{
         console.log("Result :",docs.pos);
         pos = docs.pos;
         })
         .catch((err)=>{
         console.log(err);
         });;
   
      const isTech = pos == "tech";
      console.log(isTech);

      const deletedSlot = await seatModel.findOneAndUpdate(
         { Slot: slot, Room: room, DateTimeRes: date }, // find by slot id
         { Availability: slotAvailability, Reservee: "none", DateTimeReq: "none"}, // update username and desc
         { new: true } // return updated document
      );

      const seatReservations = await seatModel.find({}).sort({ID: 1}).lean()
      const users = await userList.find({}).lean();

      if(req.body.edit){
         if(isTech){
            res.render('editslot', {
            layout: 'index',
            seatArray: seatReservations,  
            users: users,
            tech: true
            });
         }
         else{
            res.render('editslot', {
               layout: 'index',
               seatArray: seatReservations,  
               users: users,
               tech: false
               });
         }
      }
      
   } catch (error) {
      console.error('Error deleting:', error);
      res.status(500).json({ error: 'An error occurred while deleting' });
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

server.listen(port, () => {
   console.log('Started on port ${port}');
});