const dao = require('../dao/setsDao');

test("ReadAll has sets", function(){
    let lstSets = dao.readAll();
    expect(lstSets.length).toBeGreaterThan(0);
});

test("Read method", function(){
    let firstSet = dao.readAll()[0];
    let found = dao.read(firstSet._id);
    expect(found._id).toBe(firstSet._id);
});

test("Create method", function(){
    let newSet = {
        name: "Create Set Test",
        category: "Testing",
        description: "Created in test"
    };

    let created = dao.create(newSet);
    let found = dao.read(created._id);
    expect(created._id).toBeDefined();
    expect(found.name).toBe("Create Set Test");
    dao.del(created._id);
});

test("Update method", function(){
    let firstSet = dao.readAll()[0];
    let updatedSet = {
        _id: firstSet._id,
        name: "New Name",
        category: firstSet.category,
        description: firstSet.description
    };

    dao.update(updatedSet);
    let found = dao.read(firstSet._id);
    expect(found.name).toBe("New Name");
});

test("Delete method", function(){
    let newSet = {
        name: "Delete Test",
        category: "Testing",
        description: "To be deleted"
    };

    let created = dao.create(newSet);
    dao.del(created._id);
    let found = dao.read(created._id);
    expect(found).toBeNull();
});