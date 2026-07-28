const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    type: { type: String, enum: ['term_definition', 'math', 'code'], required: true },

    // Optional group name (any card type). References a name in the set's
    // own `groups` list; empty/absent means the card isn't in a group.
    group: String,

    // term_definition
    term: String,
    definition: String,
    frontSide: { type: String, enum: ['term', 'definition'], default: 'term' },
    termImage: String,
    definitionImage: String,

    // math
    question: String,
    correctAnswerExpr: String,
    correctAnswerValue: Number,

    // code (question is reused as the prompt/description here too)
    language: { type: String, enum: ['java', 'python', 'javascript', 'c', 'cpp', 'csharp', 'html'], default: 'java' },
    codeTemplate: String,
    correctFill: String,
    expectedOutput: String
});

// A named group of cards. `mode` controls what happens in Study Mode:
// 'immediate' behaves like today (right answers leave the queue right away),
// 'forced' locks study mode onto the group until every card in it is done,
// per the set's groupForceMode setting.
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mode: { type: String, enum: ['immediate', 'forced'], default: 'immediate' }
}, { _id: false });

const setSchema = mongoose.Schema({
    name: String,
    category: String,
    description: String,
    creation: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    cards: { type: [cardSchema], default: [] },
    groups: { type: [groupSchema], default: [] },
    // Pre-fills a new group's mode when the set owner adds one in the editor.
    defaultGroupMode: { type: String, enum: ['immediate', 'forced'], default: 'immediate' },
    // How every 'forced' group in this set behaves: 'locked' credits each
    // card individually but won't let you leave until all are done;
    // 'allornothing' requires one clean pass with no wrong answers.
    groupForceMode: { type: String, enum: ['locked', 'allornothing'], default: 'locked' }
});

const setModel = mongoose.model('set', setSchema);

exports.readAll = async function() {
    //Sorts the cards by order created (newest first)
    const lstSets = await setModel.find().sort({ creation: -1});
    return lstSets;
}

exports.read = async function(sid) {
    const set = await setModel.findById(sid);
    return set;
}

exports.readByOwner = async function(ownerId) {
    const lstSets = await setModel.find({ owner: ownerId }).sort({ creation: -1 });
    return lstSets;
}

exports.create = async function(set) {
    const mongoSet = new setModel(set);
    await mongoSet.save();
    return mongoSet;
}

exports.update = async function(set) {
    const updated = await setModel.findByIdAndUpdate(
        set._id,
        {
            name: set.name,
            category: set.category,
            description: set.description,
            cards: set.cards,
            groups: set.groups,
            defaultGroupMode: set.defaultGroupMode,
            groupForceMode: set.groupForceMode,
            updatedAt: new Date()
        },
        { new: true }
    );

    return updated;
}

exports.del = async function(sid) {
    const set = await setModel.findByIdAndDelete(sid);
    return set;
}

exports.deleteAll = async function(check) {
    if (check === "test") {
        await setModel.deleteMany();
    }
}