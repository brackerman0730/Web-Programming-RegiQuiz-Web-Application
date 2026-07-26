const javaRunner = require('../services/javaRunner');

test('Valid program compiles and runs correctly', async function() {
    let template = 'public class Main { public static void main(String[] a) { System.out.println(___BLANK___); } }';

    let result = await javaRunner.runTemplate(template, '2 + 2');

    expect(result.success).toBe(true);
    expect(result.compileError).toBeNull();
    expect(result.stdout.trim()).toEqual('4');
});

test('Broken program returns a compile error instead of throwing', async function() {
    let template = 'public class Main { public static void main(String[] a) { System.out.println(___BLANK___) } }';

    let result = await javaRunner.runTemplate(template, '2 + 2');

    expect(result.success).toBe(false);
    expect(typeof result.compileError).toEqual('string');
    expect(result.compileError.length).toBeGreaterThan(0);
});

test('Infinite loop times out instead of hanging', async function() {
    let template = 'public class Main { public static void main(String[] a) { while(true) {} } }';

    let result = await javaRunner.runTemplate(template, '');

    expect(result.timedOut).toBe(true);
}, 15000);
