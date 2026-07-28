const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const BLANK_TOKEN = '___BLANK___';
const TIMEOUT_MS = 5000;

// Some runtimes (Node in particular) colorize console output with ANSI escape
// codes if a FORCE_COLOR-type variable is inherited from this process's own
// environment, even though they're writing to a plain pipe here, not a real
// terminal. That would corrupt the exact-string output comparisons this whole
// feature depends on, so color forcing is explicitly turned off for every
// spawned process.
const CHILD_ENV = Object.assign({}, process.env, { NO_COLOR: '1', FORCE_COLOR: '0' });

function run(cmd, args, opts) {
    return new Promise(function(resolve) {
        execFile(cmd, args, Object.assign({ env: CHILD_ENV }, opts), function(error, stdout, stderr) {
            resolve({ error, stdout, stderr });
        });
    });
}

// Per-language: filename to write, an optional compile step, and a run step.
// Both compile/run are factories (given tmpDir) since the compiled languages
// need the full path to the produced binary - execFile doesn't use a shell,
// so a bare "main.exe" wouldn't resolve against cwd the way it would in a
// real terminal.
const LANGUAGES = {
    java: {
        filename: 'Main.java',
        compile: (tmpDir) => ({ cmd: 'javac', args: ['Main.java'] }),
        run: (tmpDir) => ({ cmd: 'java', args: ['-cp', tmpDir, 'Main'] })
    },
    python: {
        filename: 'main.py',
        compile: null,
        run: (tmpDir) => ({ cmd: 'python', args: ['main.py'] })
    },
    javascript: {
        filename: 'main.js',
        compile: null,
        run: (tmpDir) => ({ cmd: 'node', args: ['main.js'] })
    },
    c: {
        filename: 'main.c',
        compile: (tmpDir) => ({ cmd: 'gcc', args: ['main.c', '-o', 'main.exe'] }),
        run: (tmpDir) => ({ cmd: path.join(tmpDir, 'main.exe'), args: [] })
    },
    cpp: {
        filename: 'main.cpp',
        compile: (tmpDir) => ({ cmd: 'g++', args: ['main.cpp', '-o', 'main.exe'] }),
        run: (tmpDir) => ({ cmd: path.join(tmpDir, 'main.exe'), args: [] })
    },
    csharp: {
        filename: 'Main.cs',
        compile: (tmpDir) => ({ cmd: 'csc', args: ['-nologo', 'Main.cs'] }),
        run: (tmpDir) => ({ cmd: path.join(tmpDir, 'Main.exe'), args: [] })
    }
    // html has no entry here - it's checked by text comparison and never
    // reaches this runner at all (see controllers/cardsController.js).
};

// Turns a missing compiler/interpreter (ENOENT) into a friendly message,
// reusing the same compileError slot the UI already knows how to render.
function describeError(cmd, error, stderr) {
    if (error && error.code === 'ENOENT') {
        let label = path.basename(cmd, path.extname(cmd));
        return `${label} not found — install it and make sure it's on PATH.`;
    }
    return stderr || (error && error.message) || 'Unknown error';
}

exports.BLANK_TOKEN = BLANK_TOKEN;
exports.SUPPORTED_LANGUAGES = Object.keys(LANGUAGES).concat(['html']);

// Not a hardened sandbox: only protection is a wall-clock timeout on compile/run.
exports.runTemplate = async function(language, template, fillValue) {
    const config = LANGUAGES[language];
    const result = { success: false, stdout: '', stderr: '', timedOut: false, compileError: null };

    if (!config) {
        result.compileError = `Unsupported language: ${language}`;
        return result;
    }

    const source = template.split(BLANK_TOKEN).join(fillValue);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'regiquiz-'));

    try {
        fs.writeFileSync(path.join(tmpDir, config.filename), source, 'utf8');

        if (config.compile) {
            const step = config.compile(tmpDir);
            const compile = await run(step.cmd, step.args, { cwd: tmpDir, timeout: TIMEOUT_MS });
            if (compile.error) {
                result.compileError = describeError(step.cmd, compile.error, compile.stderr);
                result.timedOut = !!compile.error.killed;
                return result;
            }
        }

        const runStep = config.run(tmpDir);
        const exec = await run(runStep.cmd, runStep.args, { cwd: tmpDir, timeout: TIMEOUT_MS });

        // Covers a missing interpreter (python/node not installed) the same
        // way as a missing compiler above.
        if (exec.error && exec.error.code === 'ENOENT') {
            result.compileError = describeError(runStep.cmd, exec.error, exec.stderr);
            return result;
        }

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
            console.warn('codeRunner: failed to clean up temp dir', tmpDir, cleanupError.message);
        }
    }
};
