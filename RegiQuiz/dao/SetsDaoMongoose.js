const mongoose = require("mongoose");

const setSchema = mongoose.Schema({
    name: String,
    category: String,
    description: String,
    creation: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }
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
            description: set.description
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