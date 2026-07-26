const dao = require('../dao/SetsDaoMongoose');

exports.getAll = async function(req, res) {
    res.status(200);
    res.send( await dao.readAll() );
    res.end();
};

exports.getMine = async function(req, res) {
    if (!req.session.userId) {
        res.status(401);
        res.send({ msg: 'You must be logged in to view your sets' });
        res.end();
        return;
    }

    res.status(200);
    res.send( await dao.readByOwner(req.session.userId) );
    res.end();
};

exports.get = async function(req, res) {
    let sid = req.params.sid;

    let set = await dao.read(sid);

    if (set != null) {
        res.status(200);
        res.send(set);
    } else {
        res.status(404);
        res.send({msg: 'Set with this ID does not exist'});
    }

    res.end();
};

exports.postCreateUpdate = async function(req, res) {
    if (!req.session.userId) {
        res.redirect('/login.html');
        return;
    }

    let sname = req.body.txt_name;
    let scategory = req.body.txt_category;
    let sdescription = req.body.txt_description;

    if (req.body.txt_id && req.body.txt_id !== "") {

        let existing = await dao.read(req.body.txt_id);
        if (!existing || String(existing.owner) !== req.session.userId) {
            res.redirect('/mysets.html?error=forbidden');
            return;
        }

        let updatedSet = {
            _id: req.body.txt_id,
            name: sname,
            category: scategory,
            description: sdescription
        };

        await dao.update(updatedSet);
    } else {
        let newSet = {
            name: sname,
            category: scategory,
            description: sdescription,
            owner: req.session.userId
        };

        await dao.create(newSet);
    }

    res.redirect('mysets.html');
};

exports.getDelete = async function(req, res) {
    let sid = req.params.sid;

    if (!req.session.userId) {
        res.redirect('/login.html');
        return;
    }

    let existing = await dao.read(sid);
    if (!existing || String(existing.owner) !== req.session.userId) {
        res.redirect('/mysets.html?error=forbidden');
        return;
    }

    await dao.del(sid);

    res.redirect('../mysets.html');
};
