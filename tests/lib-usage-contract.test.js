// Guardrails for app/lib usage before cleanup/removal work.
// These tests document which lib assets are runtime-critical vs compatibility-only.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const APP_XHTML = path.join(REPO_ROOT, 'app', 'app.xhtml');
const APP_DIR = path.join(REPO_ROOT, 'app');
const VENDOR_MANIFEST = path.join(REPO_ROOT, 'app', 'lib', 'vendor-manifest.json');

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

    test('vendored MDI file set exists in app/lib', () => {
        const mdiCss = path.join(REPO_ROOT, 'app', 'lib', 'mdi', 'css', 'materialdesignicons.min.css');
        const mdiFontsDir = path.join(REPO_ROOT, 'app', 'lib', 'mdi', 'fonts');
        const expectedFonts = [
            'materialdesignicons-webfont.eot',
            'materialdesignicons-webfont.ttf',
            'materialdesignicons-webfont.woff',
            'materialdesignicons-webfont.woff2'
        ];

        expect(fs.existsSync(mdiCss)).toBe(true);
        for (const fileName of expectedFonts) {
            expect(fs.existsSync(path.join(mdiFontsDir, fileName))).toBe(true);
        }
    });

    test('vendor manifest exists and records synced package versions', () => {
        expect(fs.existsSync(VENDOR_MANIFEST)).toBe(true);
        const manifest = JSON.parse(fs.readFileSync(VENDOR_MANIFEST, 'utf8'));

        expect(manifest.packages.bootstrap.version).toBeTruthy();
        expect(manifest.packages['font-awesome'].version).toBeTruthy();
        expect(manifest.packages.codemirror.version).toBeTruthy();
        expect(manifest.packages['@mdi/font'].version).toBeTruthy();
        expect(Array.isArray(manifest.files)).toBe(true);
        expect(manifest.files.some(file => file.path === 'lib/mdi/css/materialdesignicons.min.css')).toBe(true);
        expect(manifest.files.some(file => file.path === 'lib/codemirror/codemirror.js')).toBe(true);
    });

    test('dead legacy files are removed', () => {
        const removedFiles = [
            path.join(REPO_ROOT, 'app', 'app_.xhtml'),
            path.join(REPO_ROOT, 'app', 'lib', 'common-dom.js'),
            path.join(REPO_ROOT, 'app', 'lib', 'loader.js')
        ];

        for (const filePath of removedFiles) {
            expect(fs.existsSync(filePath)).toBe(false);
        }
    });

    test('live app source does not reference removed legacy files', () => {
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
                if (
                    content.includes('app_.xhtml') ||
                    content.includes('common-dom.js') ||
                    content.includes('loader.js')
                ) {
                    refs.push(path.relative(REPO_ROOT, abs));
                }
            }
        }

        walk(APP_DIR);
        expect(refs).toEqual([]);

        const mainXhtml = read(APP_XHTML);
        expect(mainXhtml).not.toContain('common-dom.js');
        expect(mainXhtml).not.toContain('loader.js');
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
