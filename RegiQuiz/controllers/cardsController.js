const dao = require('../dao/SetsDaoMongoose');
const { evaluate } = require('mathjs');
const codeRunner = require('../services/codeRunner');

function normalizeText(s) {
    return (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

exports.postCheckCard = async function(req, res) {
    let setId = req.body.setId;
    let cardId = req.body.cardId;
    let answer = req.body.answer;

    let set;
    try { set = await dao.read(setId); } catch { set = null; }
    if (!set) {
        res.status(404).send({ msg: 'Set not found' });
        return;
    }

    let card = set.cards.id(cardId);
    if (!card) {
        res.status(404).send({ msg: 'Card not found' });
        return;
    }

    if (card.type === 'math') {
        try {
            let studentValue = evaluate(answer);
            let correct = typeof studentValue === 'number' &&
                Math.abs(studentValue - card.correctAnswerValue) < 1e-9;
            res.send({ correct, studentValue });
        } catch {
            res.send({ correct: false, error: "Couldn't evaluate your expression" });
        }
        return;
    }

    if (card.type === 'code') {
        let language = card.language || 'java';

        if (language === 'html') {
            let correct = normalizeText(answer) === normalizeText(card.correctFill);
            res.send({
                correct,
                stdout: answer,
                stderr: '',
                compileError: null,
                timedOut: false,
                expectedOutput: card.correctFill
            });
            return;
        }

        let result = await codeRunner.runTemplate(language, card.codeTemplate, answer);
        let correct = result.success && result.stdout.trim() === card.expectedOutput.trim();
        res.send({
            correct,
            stdout: result.stdout,
            stderr: result.stderr,
            compileError: result.compileError,
            timedOut: result.timedOut,
            expectedOutput: card.expectedOutput
        });
        return;
    }

    res.status(400).send({ msg: 'This card type has no server-side check' });
};
