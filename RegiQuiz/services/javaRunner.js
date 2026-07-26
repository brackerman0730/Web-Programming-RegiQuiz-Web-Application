const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const BLANK_TOKEN = '___BLANK___';
const TIMEOUT_MS = 5000;

function run(cmd, args, opts) {
    return new Promise(function(resolve) {
        execFile(cmd, args, opts, function(error, stdout, stderr) {
            resolve({ error, stdout, stderr });
        });
    });
}

exports.BLANK_TOKEN = BLANK_TOKEN;

// Compiles and runs a Java program made by substituting fillValue into template's blank marker.
// Not a hardened sandbox: only protection is a wall-clock timeout on compile/run.
exports.runTemplate = async function(template, fillValue) {
    const source = template.split(BLANK_TOKEN).join(fillValue);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'regiquiz-'));
    const result = { success: false, stdout: '', stderr: '', timedOut: false, compileError: null };

    try {
        fs.writeFileSync(path.join(tmpDir, 'Main.java'), source, 'utf8');

        const compile = await run('javac', ['Main.java'], { cwd: tmpDir, timeout: TIMEOUT_MS });
        if (compile.error) {
            result.compileError = compile.stderr || compile.error.message;
            result.timedOut = !!compile.error.killed;
            return result;
        }

        const exec = await run('java', ['-cp', tmpDir, 'Main'], { cwd: tmpDir, timeout: TIMEOUT_MS });
        result.stdout = exec.stdout;
        result.stderr = exec.stderr;
        result.timedOut = !!(exec.error && exec.error.killed);
        result.success = !exec.error;
        return result;
    } finally {
        // Best-effort cleanup: a killed (timed out) process can hold the temp dir locked
        // on Windows for a while after termination. A leftover temp dir is harmless, so
        // don't let a cleanup failure surface as an error from what was otherwise a
        // successful run.
        try {
            fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
        } catch (cleanupError) {
            console.warn('javaRunner: failed to clean up temp dir', tmpDir, cleanupError.message);
        }
    }
};
