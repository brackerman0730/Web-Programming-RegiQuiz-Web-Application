const mongoose = require("mongoose");

// One doc per (user, set): which cards that user has already mastered in
// that set, so Study Mode can resume instead of starting over.
const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    set: { type: mongoose.Schema.Types.ObjectId, ref: 'set', required: true },
    masteredCardIds: { type: [String], default: [] },
    // Answered wrong at least once, not yet mastered ("still learning").
    inProgressCardIds: { type: [String], default: [] },
    updatedAt: { type: Date, default: Date.now }
});
progressSchema.index({ user: 1, set: 1 }, { unique: true });

const progressModel = mongoose.model('progress', progressSchema);

exports.read = async function(userId, setId) {
    return await progressModel.findOne({ user: userId, set: setId });
}

exports.readAllForUser = async function(userId) {
    return await progressModel.find({ user: userId });
}

exports.save = async function(userId, setId, masteredCardIds, inProgressCardIds) {
    return await progressModel.findOneAndUpdate(
        { user: userId, set: setId },
        { masteredCardIds, inProgressCardIds, updatedAt: new Date() },
        { upsert: true, new: true }
    );
}

exports.deleteAll = async function(check) {
    if (check === "test") {
        await progressModel.deleteMany();
    }
}
