// Guardrails for app/lib usage before cleanup/removal work.
// These tests document which lib assets are runtime-critical vs compatibility-only.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const APP_XHTML = path.join(REPO_ROOT, 'app', 'app.xhtml');
const APP_UNDERSCORE_XHTML = path.join(REPO_ROOT, 'app', 'app_.xhtml');

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
});
