const dao = require('../dao/SetsDaoMongoose');
const dbcon = require('../DbConnection');

beforeAll(async function() {
    await dbcon.connect("test");
    await dao.deleteAll("test");
});

afterAll(async function() {
    await dao.deleteAll("test");
    await dbcon.disconnect();
});

afterEach(async function() {
    await dao.deleteAll("test");
});

test('Create New Set With Mongoose', async function() {
    let newSet = {
        name: "Binary Search",
        category: "Computer Science",
        description: "Efficient search algorithm"
    };

    let created = await dao.create(newSet);
    let found = await dao.read(created._id);

    
    expect(created._id).toBeDefined();
    expect(found).not.toBeNull();
    expect(created.name).toEqual(found.name);
});

test('Delete a Set', async function() {
    let newSet = {
        name: "Pointers",
        category: "Computer Science",
        description: "Memory references"
    };

    let created = await dao.create(newSet);
    let foundBeforeDel = await dao.read(created._id);
    let deleted = await dao.del(created._id);
    let foundAfterDel = await dao.read(created._id);

    expect(foundBeforeDel).not.toBeNull();
    expect(foundAfterDel).toBeNull();
    expect(deleted.name).toEqual(created.name);
});

test('Read all sets - Empty database', async function() {
    let lstSets = await dao.readAll();

    expect(lstSets.length).toBe(0);
});


test('Update a Set', async function() {
    let newSet = {
        name: "Old Name",
        category: "Old Category",
        description: "Old Description"
    };

    let created = await dao.create(newSet);

    let updatedSet = {
        _id: created._id,
        name: "New Name",
        category: "New Category",
        description: "New Description"
    };

    let updated = await dao.update(updatedSet);
    let found = await dao.read(created._id);

    expect(updated.name).toEqual("New Name");
    expect(found.category).toEqual("New Category");
});

test('Read one set', async function() {
    let newSet = {
        name: "Read Test",
        category: "Testing",
        description: "Testing read"
    };

    let created = await dao.create(newSet);
    let found = await dao.read(created._id);

    expect(found).not.toBeNull();
    expect(found.name).toEqual(created.name);
});