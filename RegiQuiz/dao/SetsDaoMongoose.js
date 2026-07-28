const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
    type: { type: String, enum: ['term_definition', 'math', 'code'], required: true },

    // term_definition
    term: String,
    definition: String,

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

const setSchema = mongoose.Schema({
    name: String,
    category: String,
    description: String,
    creation: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    cards: { type: [cardSchema], default: [] }
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
            cards: set.cards
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