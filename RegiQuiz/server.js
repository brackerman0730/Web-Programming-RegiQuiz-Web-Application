const controller = require("./controllers/setsController");

let hostname = "localhost";
let port = 3000;

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


const server = app.listen(port, hostname, function() {
    console.log(`Server running on ${hostname}:${port}`);
});