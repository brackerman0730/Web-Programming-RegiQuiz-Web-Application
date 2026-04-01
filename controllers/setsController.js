const dao = require('../dao/setsDao');

exports.getAll = function(req, res) {
    res.status(200);
    res.send(dao.readAll());
    res.end();
};

exports.get = function(req, res) {
    let sid = parseInt(req.params.sid);

    let set = dao.read(sid);

    if (set != null) {
        res.status(200);
        res.send(set);
    } else {
        res.status(404);
        res.send({msg: 'Set with this ID does not exist'});
    }

    res.end();
};

exports.postCreateUpdate = function(req, res) {
    let sname = req.body.txt_name;
    let scategory = req.body.txt_category;
    let sdescription = req.body.txt_description;

    if (req.body.txt_id && req.body.txt_id !== "") {
        let sid = parseInt(req.body.txt_id);

        let updatedSet = {
            _id: sid,
            name: sname,
            category: scategory,
            description: sdescription
        };

        dao.update(updatedSet);
    } else {
        let newSet = {
            name: sname,
            category: scategory,
            description: sdescription
        };

        dao.create(newSet);
    }

    res.redirect('mysets.html');
};

exports.getDelete = function(req, res) {
    let sid = parseInt(req.params.sid);

    dao.del(sid);

    res.redirect('../mysets.html');
};