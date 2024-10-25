const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

mongoose.connect('mongodb://localhost:27017/studentDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
});

const Student = mongoose.model('Student', studentSchema);


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/students', async (req, res) => {
    const students = await Student.find();
    res.render('students', { students });
});

app.get('/students/new', (req, res) => {
    res.render('new-student');
});

app.post('/students', async (req, res) => {
    const { name, age, email } = req.body;
    const newStudent = new Student({ name, age, email });
    await newStudent.save();
    res.redirect('/students');
});

app.get('/students/edit/:id', async (req, res) => {
    const student = await Student.findById(req.params.id);
    res.render('edit-student', { student });
});

app.post('/students/edit/:id', async (req, res) => {
    const { name, age, email } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { name, age, email });
    res.redirect('/students');
});

app.post('/students/delete/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
