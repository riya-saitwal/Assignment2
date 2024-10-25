const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const multer = require('multer');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  store: new FileStore(),
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));

const upload = multer({ dest: 'uploads/' });

function isAuthenticated(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

const users = {
    aayush: { username: 'aayush', passwordHash: bcrypt.hashSync('1111', 10) },
  };
  

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
  });
  

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
  
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('Stored User:', user);
  
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
      req.session.isLoggedIn = true;
      req.session.username = username;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid username or password');
    }
  });
  

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { username: req.session.username });
});

app.post('/upload', isAuthenticated, upload.single('file'), (req, res) => {
  if (req.file) {
    res.send(`File uploaded: ${req.file.originalname}`);
  } else {
    res.send('No file uploaded');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login');
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
