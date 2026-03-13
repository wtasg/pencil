// Guardrails for app/lib usage before cleanup/removal work.
// These tests document which lib assets are runtime-critical vs compatibility-only.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const APP_XHTML = path.join(REPO_ROOT, 'app', 'app.xhtml');
const APP_UNDERSCORE_XHTML = path.join(REPO_ROOT, 'app', 'app_.xhtml');
const APP_DIR = path.join(REPO_ROOT, 'app');

function read(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

describe('app/lib runtime contract', () => {
    test('app.xhtml directly loads runtime lib assets', () => {
        const xhtml = read(APP_XHTML);

        // Runtime CodeMirror bundle (vendored in app/lib)
        expect(xhtml).toContain('src="lib/codemirror/codemirror.js"');
        expect(xhtml).toContain('href="lib/codemirror/codemirror.css"');
        expect(xhtml).toContain('src="lib/codemirror/javascript.js"');
        expect(xhtml).toContain('src="lib/codemirror/xml.js"');

        // Widget framework base class file from app/lib
        expect(xhtml).toContain('src="lib/widget/Common.js"');
    });

    test('vendored CodeMirror file set exists in app/lib', () => {
        const codemirrorDir = path.join(REPO_ROOT, 'app', 'lib', 'codemirror');
        const expectedFiles = [
            'codemirror.js',
            'codemirror.css',
            'javascript.js',
            'xml.js',
            'htmlmixed.js'
        ];

        for (const fileName of expectedFiles) {
            expect(fs.existsSync(path.join(codemirrorDir, fileName))).toBe(true);
        }
    });

    test('legacy app_.xhtml is the only in-repo consumer of common-dom.js', () => {
        const oldXhtml = read(APP_UNDERSCORE_XHTML);
        expect(oldXhtml).toContain('src="lib/common-dom.js"');

        const mainXhtml = read(APP_XHTML);
        expect(mainXhtml).not.toContain('src="lib/common-dom.js"');
    });

    test('compat shims exist and remain importable for tests/tooling', () => {
        const qShimPath = path.join(REPO_ROOT, 'app', 'lib', 'q-shim.js');
        const jimpShimPath = path.join(REPO_ROOT, 'app', 'lib', 'jimp-shim.js');

        expect(fs.existsSync(qShimPath)).toBe(true);
        expect(fs.existsSync(jimpShimPath)).toBe(true);

        const Q = require('../app/lib/q-shim');
        const jimp = require('../app/lib/jimp-shim');

        expect(typeof Q.Promise).toBe('function');
        expect(typeof jimp.read).toBe('function');
    });

    test('no live source references bundled fontconfig.exe', () => {
        const scanExts = ['.js', '.xhtml', '.html', '.xml', '.less', '.css'];
        const skipDirs = new Set(['node_modules', 'archive', 'dist']);
        const refs = [];

        function walk(dir) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const abs = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (!skipDirs.has(entry.name)) walk(abs);
                    continue;
                }
                if (!scanExts.some(ext => entry.name.endsWith(ext))) continue;
                const content = fs.readFileSync(abs, 'utf8');
                if (content.includes('fontconfig.exe') || content.includes('lib/fontconfig')) {
                    refs.push(path.relative(REPO_ROOT, abs));
                }
            }
        }

        walk(APP_DIR);
        expect(refs).toEqual([]);
    });

    test('bundled fontconfig.exe is removed', () => {
        const exePath = path.join(REPO_ROOT, 'app', 'lib', 'fontconfig', 'fontconfig.exe');
        expect(fs.existsSync(exePath)).toBe(false);
    });
});
