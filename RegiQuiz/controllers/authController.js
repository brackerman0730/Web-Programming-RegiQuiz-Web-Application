const bcrypt = require('bcryptjs');
const dao = require('../dao/UsersDaoMongoose');

exports.postRegister = async function(req, res) {
    let username = req.body.txt_username;
    let password = req.body.txt_password;

    if (!username || !password) {
        res.redirect('/register.html?error=missing');
        return;
    }

    let existing = await dao.findByUsername(username);
    if (existing) {
        res.redirect('/register.html?error=taken');
        return;
    }

    try {
        let passwordHash = await bcrypt.hash(password, 10);
        let user = await dao.create({ username, passwordHash });

        req.session.userId = user._id.toString();
        req.session.username = user.username;
        req.session.creation = user.creation;

        res.redirect('/mysets.html');
    } catch (error) {
        res.redirect('/register.html?error=taken');
    }
};

exports.postLogin = async function(req, res) {
    let username = req.body.txt_username;
    let password = req.body.txt_password;

    let user = await dao.findByUsername(username || '');
    if (!user) {
        res.redirect('/login.html?error=1');
        return;
    }

    let match = await bcrypt.compare(password || '', user.passwordHash);
    if (!match) {
        res.redirect('/login.html?error=1');
        return;
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.creation = user.creation;

    res.redirect('/mysets.html');
};

exports.getLogout = function(req, res) {
    req.session.destroy(function() {
        res.redirect('/index.html');
    });
};

exports.postChangePassword = async function(req, res) {
    if (!req.session.userId) {
        res.status(401).send({ success: false, message: 'You must be logged in.' });
        return;
    }

    let currentPassword = req.body.currentPassword;
    let newPassword = req.body.newPassword;

    if (!currentPassword || !newPassword) {
        res.status(400).send({ success: false, message: 'Please fill out both fields.' });
        return;
    }

    let user = await dao.findById(req.session.userId);
    let match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
        res.status(400).send({ success: false, message: 'Current password is incorrect.' });
        return;
    }

    let newPasswordHash = await bcrypt.hash(newPassword, 10);
    await dao.updatePassword(req.session.userId, newPasswordHash);

    res.send({ success: true });
};

exports.postDeleteAccount = async function(req, res) {
    if (!req.session.userId) {
        res.status(401).send({ success: false, message: 'You must be logged in.' });
        return;
    }

    let userId = req.session.userId;

    await dao.deleteUser(userId);

    req.session.destroy(function() {
        res.send({ success: true });
    });
};

exports.getWhoAmI = function(req, res) {
    if (req.session.userId) {
        res.send({ loggedIn: true, userId: req.session.userId, username: req.session.username, creation: req.session.creation });
    } else {
        res.send({ loggedIn: false });
    }
};
