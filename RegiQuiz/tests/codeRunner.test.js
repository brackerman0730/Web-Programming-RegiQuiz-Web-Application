const codeRunner = require('../services/codeRunner');

test('Valid Java program compiles and runs correctly', async function() {
    let template = 'public class Main { public static void main(String[] a) { System.out.println(___BLANK___); } }';

    let result = await codeRunner.runTemplate('java', template, '2 + 2');

    expect(result.success).toBe(true);
    expect(result.compileError).toBeNull();
    expect(result.stdout.trim()).toEqual('4');
});

test('Broken Java program returns a compile error instead of throwing', async function() {
    let template = 'public class Main { public static void main(String[] a) { System.out.println(___BLANK___) } }';

    let result = await codeRunner.runTemplate('java', template, '2 + 2');

    expect(result.success).toBe(false);
    expect(typeof result.compileError).toEqual('string');
    expect(result.compileError.length).toBeGreaterThan(0);
});

test('Infinite loop times out instead of hanging', async function() {
    let template = 'public class Main { public static void main(String[] a) { while(true) {} } }';

    let result = await codeRunner.runTemplate('java', template, '');

    expect(result.timedOut).toBe(true);
}, 15000);

test('Valid Python program runs correctly', async function() {
    let result = await codeRunner.runTemplate('python', 'print(___BLANK___)', '2 + 2');

    expect(result.success).toBe(true);
    expect(result.stdout.trim()).toEqual('4');
});

test('Valid JavaScript program runs correctly', async function() {
    let result = await codeRunner.runTemplate('javascript', 'console.log(___BLANK___);', '2 + 2');

    expect(result.success).toBe(true);
    expect(result.stdout.trim()).toEqual('4');
});
