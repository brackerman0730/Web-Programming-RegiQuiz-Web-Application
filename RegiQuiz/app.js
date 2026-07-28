const controller = require("./controllers/setsController");
const authController = require("./controllers/authController");
const cardsController = require("./controllers/cardsController");
const uploadController = require("./controllers/uploadController");
const progressController = require("./controllers/progressController");

const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const app = express();

app.use(morgan('dev'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URI, collectionName: 'sessions' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/sets', controller.getAll);
app.get('/mysets', controller.getMine);
app.get('/sets/:sid', controller.get);
app.post('/sets', controller.postCreateUpdate);
app.get('/deleteset/:sid', controller.getDelete);
app.post('/updateset/', controller.postCreateUpdate);

app.post('/register', authController.postRegister);
app.post('/login', authController.postLogin);
app.get('/logout', authController.getLogout);
app.get('/api/whoami', authController.getWhoAmI);
app.post('/change-password', authController.postChangePassword);
app.post('/delete-account', authController.postDeleteAccount);
app.post('/checkcard', cardsController.postCheckCard);

// /progress/mine must be registered before /progress/:setId, otherwise
// Express would match "mine" as a setId value instead.
app.get('/progress/mine', progressController.getMine);
app.get('/progress/:setId', progressController.get);
app.post('/progress', progressController.postSave);

// Card image upload for term_definition cards. Auth check runs before the
// multer middleware so a logged-out request never gets its file written to disk.
app.post('/upload/card-image', uploadController.requireLogin, function(req, res) {
    uploadController.uploadMiddleware(req, res, function(err) {
        if (err) {
            res.status(400).send({ msg: err.message });
            return;
        }
        uploadController.postCardImage(req, res);
    });
});

exports.app = app;
