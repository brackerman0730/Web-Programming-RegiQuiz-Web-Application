const dao = require('../dao/SetsDaoMongoose');

exports.getAll = async function(req, res) {
    res.status(200);
    res.send( await dao.readAll() );
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
    let sname = req.body.txt_name;
    let scategory = req.body.txt_category;
    let sdescription = req.body.txt_description;

    if (req.body.txt_id && req.body.txt_id !== "") {

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
            description: sdescription
        };

        await dao.create(newSet);
    }

    res.redirect('mysets.html');
};

exports.getDelete = async function(req, res) {
    let sid = req.params.sid;

    await dao.del(sid);

    res.redirect('../mysets.html');
};