require('dotenv').config();
const mongoose = require("mongoose");
const dns = require("dns");

// Workaround: on some Windows setups, Node's built-in DNS resolver misreads
// the system config and falls back to 127.0.0.1, which breaks the SRV
// lookup mongodb+srv:// URIs rely on. Pointing it at public DNS avoids that.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

exports.connect = async function(where){
    let uri = process.env.DB_URI;
    if(where === 'test') uri = process.env.TESTDB_URI;
    if(process.env.CI) uri = "mongodb://adm:secret@localhost:27017"; //CI test

    try{
        await mongoose.connect(uri);
    }catch(error){
        console.log(error);
    }
}

exports.disconnect = async function(){
    await mongoose.connection.close();
}