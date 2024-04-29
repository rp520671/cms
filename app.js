const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require("express-handlebars");
const { globalVariables } = require('./config/configuration');
const { mongoDbUrl, PORT } = require('./config/configuration');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const { selectOption } = require('./config/customFunctions');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const handlebars = require('handlebars'); // Add Handlebars module

const app = express();

// Configure Mongoose to connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cms', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected Successfully!");
}).catch(err => {
    console.log("MongoDB Connection Failure:", err);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/*  Flash and Session */
app.use(session({
    secret: 'anysecret',
    saveUninitialized: true,
    resave: true
}));

app.use(flash());

/* Passport Initialize */
app.use(passport.initialize());
app.use(passport.session());

/* Use Global Variables */
app.use(globalVariables);

/* File Upload Middleware */
app.use(fileUpload());

// Setup View Engine to use Handlebars
const hbs = exphbs.create({
    defaultLayout: 'main',
    handlebars: handlebars, // Use the handlebars instance imported above
    // Disable the prototype access check in Handlebars
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

/* Method Override Middleware */
app.use(methodOverride('newMethod'));

/* Routes */
const defaultRoutes = require('./routes/defaultRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', defaultRoutes);
app.use('/admin', adminRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
