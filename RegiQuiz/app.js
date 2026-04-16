const controller = require("./controllers/setsController");

const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/sets', controller.getAll);
app.get('/sets/:sid', controller.get);
app.post('/sets', controller.postCreateUpdate);
app.get('/deleteset/:sid', controller.getDelete);
app.post('/updateset/', controller.postCreateUpdate);

exports.app = app;