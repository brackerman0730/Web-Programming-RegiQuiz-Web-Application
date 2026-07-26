const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    creation: { type: Date, default: Date.now }
});

const userModel = mongoose.model('user', userSchema);

exports.create = async function(user) {
    const mongoUser = new userModel(user);
    await mongoUser.save();
    return mongoUser;
}

exports.findByUsername = async function(username) {
    const user = await userModel.findOne({ username: username.toLowerCase().trim() });
    return user;
}

exports.findById = async function(uid) {
    const user = await userModel.findById(uid);
    return user;
}

exports.updatePassword = async function(uid, passwordHash) {
    const updated = await userModel.findByIdAndUpdate(uid, { passwordHash }, { new: true });
    return updated;
}

exports.deleteUser = async function(uid) {
    const deleted = await userModel.findByIdAndDelete(uid);
    return deleted;
}

exports.deleteAll = async function(check) {
    if (check === "test") {
        await userModel.deleteMany();
    }
}
