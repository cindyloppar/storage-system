const pg = require('pg');
const cors = require('cors');
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const passportJWT = require('passport-jwt')
const bodyParser = require('body-parser');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var connectionString = process.env.DATABASE_CREDENTIALS;
const client = new pg.Client(connectionString);
client.connect();

var DBFunctions = require('./routes/functions');

app.use(require('express-session')(
  {
    name: 'site_cookie',
    secret: "the cat crossed the road",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 100000
    }
  })
);

app.use(session({
  secret: "the cat crossed the road",
  resave: false,
  saveUninitialized: false
}));

var cookieExtractor = function (req) {
  var token = null;
  if (req && req.headers.authorization) {
    token = req.headers.authorization;
  }
  return token;
};
passport.use(new JWTStrategy({
  jwtFromRequest: cookieExtractor,
  secretOrKey: 'TestingStorage'
},
  function (jwtPayload, done) {
    DBFunctions.findUser(jwtPayload.email).then((user, err) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false)
      } else {
        return done(null, user);
      }
    })
  }
));

passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {
  cb(null, id);
});

app.use(passport.initialize());
app.use(passport.session());

function authenticationMiddleware(req, res, next) {
  jwt.verify(req.headers.authorization, "TestingStorage", function (err, decoded) {
    if (err) return res.status(302).send({ auth: false, message: 'Failed to authenticate token.' });
    req.loggedInUser = decoded;
    next()
  })
}

app.post('/businessData', authenticationMiddleware, async function (req, res) {
  try {
    await DBFunctions.insertBusinessInfo(req.body.businessName, req.body.contactName, req.body.telephone, req.body.userEmail)
    res.status(201).end();
  } catch (error) {
    res.status(203).send("sorry cant register business info : " + `${error}`).end();
  }
});
app.get('/allAvailableLocations', authenticationMiddleware, async function (req, res) {
  try {
    var allLocations = await DBFunctions.getAllAvailableLocations();
    res.send(allLocations).status(201).end();
  } catch (error) {
    res.status(203).end();
  }
});

app.get('/locations/:searchKey', authenticationMiddleware, async function (req, res) {
  try {
    var searchKey = req.params.searchKey;
    var allLocations = await DBFunctions.getAllMatchingLocations(searchKey);
    res.send(allLocations).status(201).end();
  } catch (error) {
    res.status(203).end();
  }
});
app.get('/locationsForBusiness/:businessName', authenticationMiddleware, async function (req, res) {
  try {
    var businessName = req.params.businessName;
    const allLocations = await DBFunctions.getAllLocationsForABusiness(businessName);
    res.send(allLocations).status(201).end();
  } catch (error) {
    res.status(203).end();
  }
});
app.get('/unitTypes', authenticationMiddleware, async function (req, res) {
  try {
    const units = await client.query(`SELECT name, length, width, height FROM unit_types;`);
    res.send(units.rows).status(201).end();
  } catch (error) {
    res.status(203).end();
  }
});
app.post('/unitTypes', authenticationMiddleware, async function (req, res) {
  try {
    DBFunctions.insertUnitType(req.body)
    res.status(201).end();
  } catch (error) {
    res.status(203).end();
  }
});

app.get('/businesses-for-user', async function (req, res) {
  try {
    var businessNames = await DBFunctions.getAllBusinessNamesForUser();
    res.status(200).send(businessNames).end();
  } catch (error) {
    res.status(203).end();
  }
});
app.get('/businesses/:ownerEmail', authenticationMiddleware, async function (req, res) {
  try {
    var businessNames = await DBFunctions.getAllBusinessNames(req.params.ownerEmail);
    res.status(200).send(businessNames).end();
  } catch (error) {
    res.status(203).end();
  }
});

app.get('/businessesWithLocations/:userEmail', authenticationMiddleware, async function (req, res) {
  try {
    var businessNames = await DBFunctions.getAllBusinessWithLocations(req.params.userEmail);
    res.status(200).send(businessNames).end();
  } catch (error) {
    res.status(203).end();
  }
});
app.get('/allUnits/:searchBy/:searchPhrase', async function (req, res) {
  try {
    var allUnits = await DBFunctions.getUnits(req.params);
    res.status(200).send(allUnits).end()
  } catch (error) {
    console.log('error :', error);
    res.status(203).end()
  }
});
app.post('/unit', authenticationMiddleware, async function (req, res) {
  try {
    await DBFunctions.submitUnit(req.body);
    res.status(201).end()
  } catch (error) {
    console.log('error :', error);
    res.status(203).end()
  }
});

app.post('/businessLocation', authenticationMiddleware, async function (req, res) {
  try {
    DBFunctions.insertBusinessLocation(req.body.businessName, req.body.address1, req.body.address2, req.body.city, req.body.region);
    res.status(201).end();
  } catch (error) {
    console.log('error :', error);
    res.status(203).send("sorry cant register business address : " + `${error}`).end();
  }
});
app.post('/submitBlocks', authenticationMiddleware, async function (req, res) {
  try {
    await DBFunctions.insertBlocks(req.body);
    res.status(201).end();
  } catch (error) {
    console.log('error :', error);
    res.status(203).send("sorry cant register business address : " + `${error}`).end();
  }
});
app.get('/blocks/:businessName', authenticationMiddleware, async function (req, res) {
  try {
    var businessName = req.params["businessName"];
    var allBlocks = await DBFunctions.getAllBlocks(businessName)
    res.status(201).send(allBlocks).end()
  } catch (error) {
    res.status(203).end()
  }
});
app.post('/unit/order', authenticationMiddleware, async function (req, res) {
  try {
    var unitDetails = req.body;
    await DBFunctions.orderUnit(unitDetails, req.loggedInUser)
    res.status(201).end()
  } catch (error) {
    console.log('error :', error);
    res.status(203).end()
  }
});
app.post('/signUp', async function (req, res) {
  try {
    var signUserUp = await DBFunctions.registerUser(req.body)
    if (!signUserUp) {
      res.status(204).end();
    }
    var userInfo = await DBFunctions.getUserInfo(req.body)
    var userInfoForJWT = {
      UserName: userInfo.user_name,
      email: userInfo.email,
      role: userInfo.role
    }
    const token = jwt.sign(userInfoForJWT, 'TestingStorage', { expiresIn: '24h' });
    res.json({ token }).status(201).end();
  } catch (error) {
    console.log('error :', error);
    res.status(400).end();
  }
});

app.post('/login', async function (req, res) {
  console.log("login was called");
  var user = await DBFunctions.findUser(req.body.email);
  if (!user) {
    res.status(204).json({ message: "Incorrect Email or Password." }).end();
  } else {
    var passwordValid = await bcrypt.compare(req.body.password, user.hashed_password)
    if (!passwordValid) {
      res.status(204).json({ message: "Incorrect Email or Password." }).end();
    }
    req.login(user, { session: true }, (err) => {
      if (err) {
        res.status(204).send(err).end();
      }
      var userInfoForJWT = {
        UserName: user.user_name,
        email: user.email,
        role: user.role
      }
      const token = jwt.sign(userInfoForJWT, 'TestingStorage', { expiresIn: '24h' });
      res.json({ message: 'Logged In Successfully', token }).status(202).end();
    });
  }
});


app.get('/check/jwt', function (req, res) {
  passport.authenticate('jwt', { session: true }, async (err, user, info) => {
    if (err) {
      res.status(204).json({ message: 'Something Went wrong, please try again later.' }).end();
    } else {
      var userInfo = await DBFunctions.getUserInfo(user);
      if (userInfo) {
        res.status(202).json({ user: user, }).end();
      } else {
        res.status(204).json({ message: 'Something Went wrong, please try again later.' }).end();
      }
    }
  })(req, res);
})

app.get('/user/units', authenticationMiddleware, async function (req, res) {
  var units = await DBFunctions.findClientUnits(req.loggedInUser.email);
  if (!units) {
    res.status(204).end()
  } else if (units.length <= 0) {
    res.status(203).end();
  } else {
    res.status(200).json({ units: units }).end();
  }
})

app.put('/remove/order', authenticationMiddleware, async function (req, res) {
  try {
    await DBFunctions.removeClientUnit(req.body);
    res.status(200).end();
  } catch (error) {
    res.status(203).end();
  }
})

app.get('/rented/units', authenticationMiddleware, async function (req, res) {
  var rentedUnits = await DBFunctions.getAllRentedOutUnits(req.loggedInUser.email)
  if (!rentedUnits) {
    res.status(204).end()
  } else if (rentedUnits.length <= 0) {
    res.status(203).end();
  } else {
    res.status(200).json({ rentedUnits: rentedUnits }).end();
  }
})

app.listen(3003, function () {
  console.log('web server listening on port 3003')
});