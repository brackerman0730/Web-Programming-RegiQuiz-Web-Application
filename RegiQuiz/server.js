const dao = require("./dao/setsDao");

let hostname = "localhost";
let port = 3000;

const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/sets", function(req, res) {
    res.status(200);
    res.send(dao.readAll());
    res.end();
});


app.get("/sets/:sid", function(req, res) {

    let sid = parseInt(req.params.sid);

    let set = dao.read(sid);

    if (set != null) {
        res.status(200);
        res.send(set);
    } else {
        res.status(404);
        res.send({ msg: "Set with this ID does not exist" });
    }

    res.end();
});


const server = app.listen(port, hostname, function() {
    console.log(`Server running on ${hostname}:${port}`);
});