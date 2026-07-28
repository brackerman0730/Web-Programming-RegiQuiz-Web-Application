const dao = require('../dao/ProgressDaoMongoose');

// Progress for one set, for the current logged-in user. Guests always get
// an empty list back (nothing saved server-side for them).
exports.get = async function(req, res) {
    if (!req.session.userId) {
        res.send({ masteredCardIds: [], inProgressCardIds: [] });
        return;
    }

    let progress = await dao.read(req.session.userId, req.params.setId);
    res.send({
        masteredCardIds: progress ? progress.masteredCardIds : [],
        inProgressCardIds: progress ? progress.inProgressCardIds : []
    });
};

// Bulk progress across every set the current user has studied, as
// { setId: { mastered, inProgress } } card counts, so a set-listing page can
// show completion without one request per set. Guests get an empty object.
exports.getMine = async function(req, res) {
    if (!req.session.userId) {
        res.send({});
        return;
    }

    let all = await dao.readAllForUser(req.session.userId);
    let bySet = {};
    all.forEach(function(p) {
        bySet[p.set] = { mastered: p.masteredCardIds.length, inProgress: p.inProgressCardIds.length };
    });
    res.send(bySet);
};

exports.postSave = async function(req, res) {
    if (!req.session.userId) {
        res.status(401).send({ msg: 'You must be logged in to save progress' });
        return;
    }

    let setId = req.body.setId;
    let masteredCardIds = Array.isArray(req.body.masteredCardIds) ? req.body.masteredCardIds : [];
    let inProgressCardIds = Array.isArray(req.body.inProgressCardIds) ? req.body.inProgressCardIds : [];

    await dao.save(req.session.userId, setId, masteredCardIds, inProgressCardIds);
    res.status(200).send({ ok: true });
};
