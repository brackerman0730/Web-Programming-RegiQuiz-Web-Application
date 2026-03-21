const fs = require('fs');


exports.lstSets = JSON.parse(fs.readFileSync('data.json'));


exports.readAll = function() {
    return exports.lstSets;
}

exports.create = function(set) {
    if (exports.lstSets.length === 0) {
        set._id = 1;
    } else {
        set._id = exports.lstSets[exports.lstSets.length - 1]._id + 1;
    }

    exports.lstSets.push(set);
}

exports.read = function(id) {
    let index = pos(id);
    if (index >= 0) {
        return exports.lstSets[index];
    }
    return null;
}

exports.del = function(id) {
    let index = pos(id);
    let set = null;

    if (index >= 0) {
        set = exports.lstSets[index];
        exports.lstSets.splice(index, 1);
    }

    return set;
}

exports.update = function(updatedSet) {
    let index = pos(updatedSet._id);

    if (index >= 0) {
        exports.lstSets[index] = updatedSet;
        return updatedSet;
    }

    return null;
}


function pos(id) {
    for (let i = 0; i < exports.lstSets.length; i++) {
        if (exports.lstSets[i]._id === id) {
            return i;
        }
    }
    return -1;
}