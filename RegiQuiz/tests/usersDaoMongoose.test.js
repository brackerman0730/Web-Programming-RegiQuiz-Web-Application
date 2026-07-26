const dao = require('../dao/UsersDaoMongoose');
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

test('Create a user and find by id', async function() {
    let newUser = {
        username: "flashcardfan",
        passwordHash: "hashedpassword123"
    };

    let created = await dao.create(newUser);
    let found = await dao.findById(created._id);

    expect(created._id).toBeDefined();
    expect(found).not.toBeNull();
    expect(found.username).toEqual("flashcardfan");
});

test('findByUsername is case-insensitive', async function() {
    let newUser = {
        username: "StudyBuddy",
        passwordHash: "hashedpassword456"
    };

    await dao.create(newUser);
    let found = await dao.findByUsername("studybuddy");

    expect(found).not.toBeNull();
    expect(found.username).toEqual("studybuddy");
});

test('Creating a duplicate username rejects', async function() {
    let firstUser = {
        username: "duplicatetest",
        passwordHash: "hashedpassword789"
    };

    let secondUser = {
        username: "duplicatetest",
        passwordHash: "differenthash"
    };

    await dao.create(firstUser);

    await expect(dao.create(secondUser)).rejects.toThrow();
});
