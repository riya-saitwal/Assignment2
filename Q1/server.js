require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const User = require('./models/user'); 

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

app.post('/register', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'additionalFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    const { name, email } = req.body;
    const profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0].path : null;
    const additionalFiles = req.files['additionalFiles'] ? req.files['additionalFiles'].map(file => file.path) : [];

    const user = new User({ name, email, profilePicture, additionalFiles });
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/files', async (req, res) => {
  try {
    const users = await User.find();
    const files = users.flatMap(user => [user.profilePicture, ...user.additionalFiles]).filter(file => file !== null);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  res.download(filePath, err => {
    if (err) res.status(500).json({ error: 'File not found' });
  });
});

app.get('/files-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'files.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
