const dao = require('../dao/SetsDaoMongoose');
const { evaluate } = require('mathjs');
const javaRunner = require('../services/javaRunner');

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

// Validates every card and derives its computed fields (math's correctAnswerValue,
// code's expectedOutput). Mutates the cards in place. Returns an error object
// ({ msg, detail }) on the first bad card, or null if everything's fine.
async function validateAndDeriveCards(cards) {
    for (let i = 0; i < cards.length; i++) {
        let c = cards[i];

        if (c.type === 'math') {
            let v;
            try { v = evaluate(c.correctAnswerExpr); } catch { v = null; }
            if (typeof v !== 'number' || Number.isNaN(v)) {
                return { msg: `Card ${i + 1}: couldn't evaluate the correct-answer expression.` };
            }
            c.correctAnswerValue = v;
        } else if (c.type === 'code') {
            if (!c.codeTemplate || !c.codeTemplate.includes(javaRunner.BLANK_TOKEN) || !c.correctFill) {
                return { msg: `Card ${i + 1}: template must contain ${javaRunner.BLANK_TOKEN} and have a correct fill-in.` };
            }

            let result = await javaRunner.runTemplate(c.codeTemplate, c.correctFill);
            if (!result.success) {
                return { msg: `Card ${i + 1}: your correct answer doesn't compile/run.`, detail: result.compileError || result.stderr };
            }
            c.expectedOutput = result.stdout;
        } else if (c.type === 'term_definition') {
            if (!c.term || !c.definition) {
                return { msg: `Card ${i + 1}: needs both a term and a definition.` };
            }
        }
    }

    return null;
}

exports.postCreateUpdate = async function(req, res) {
    if (!req.session.userId) {
        res.redirect('/login.html');
        return;
    }

    let sname = req.body.txt_name;
    let scategory = req.body.txt_category;
    let sdescription = req.body.txt_description;
    let cards = Array.isArray(req.body.cards) ? req.body.cards : [];

    let cardError = await validateAndDeriveCards(cards);
    if (cardError) {
        res.status(400).send(cardError);
        return;
    }

    if (req.body.txt_id && req.body.txt_id !== "") {

        let existing = await dao.read(req.body.txt_id);
        if (!existing || String(existing.owner) !== req.session.userId) {
            res.status(403).send({ msg: 'You do not own this set' });
            return;
        }

        let updatedSet = {
            _id: req.body.txt_id,
            name: sname,
            category: scategory,
            description: sdescription,
            cards: cards
        };

        await dao.update(updatedSet);
        res.status(200).send({ _id: req.body.txt_id });
        return;
    }

    let newSet = {
        name: sname,
        category: scategory,
        description: sdescription,
        owner: req.session.userId,
        cards: cards
    };

    let created = await dao.create(newSet);
    res.status(201).send({ _id: created._id });
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
