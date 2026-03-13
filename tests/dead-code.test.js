// Regression guard: verify known-unused packages and dead files stay removed.
// These tests will immediately fail if someone re-adds a dead import or file.

const fs = require('fs');
const path = require('path');

function scanDir(dir, extensions, skipDirs = ['node_modules', 'archive']) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!skipDirs.includes(entry.name)) {
                results.push(...scanDir(path.join(dir, entry.name), extensions, skipDirs));
            }
        } else if (extensions.some(e => entry.name.endsWith(e)) && !entry.name.endsWith('.min.js')) {
            results.push(path.join(dir, entry.name));
        }
    }
    return results;
}

const APP_DIR = path.join(__dirname, '..', 'app');
const appSourceFiles = scanDir(APP_DIR, ['.js']);

describe('Dead dependencies — not imported in app source', () => {
    const removedDeps = ['archive-type', 'decompress-targz', 'easy-zip2'];

    for (const dep of removedDeps) {
        test(`"${dep}" is not required anywhere in app source`, () => {
            const violations = appSourceFiles.filter(fp => {
                const content = fs.readFileSync(fp, 'utf8');
                return content.includes(`require("${dep}")`) || content.includes(`require('${dep}')`);
            });
            expect(violations).toEqual([]);
        });
    }

    test('"decompress" is not required anywhere in app source (outside commented blocks)', () => {
        const violations = appSourceFiles.filter(fp => {
            const content = fs.readFileSync(fp, 'utf8');
            // Strip block comments before checking
            const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '');
            return stripped.includes(`require("decompress")`) || stripped.includes(`require('decompress')`);
        });
        expect(violations).toEqual([]);
    });
});

describe('Dead source files — confirmed removed from live codebase', () => {
    const deadFiles = [
        'pencil-core/common/controller_old.js',
        'pencil-core/common/androidSupports.js',
        'pencil-core/n-patch/9patch_backup.js',
        'pencil-core/common/nsDragAndDrop.js',
        'pencil-core/common/pdf.js',
        'pencil-core/common/colorDroppers.js',
    ];

    for (const rel of deadFiles) {
        test(`${rel} does not exist`, () => {
            expect(fs.existsSync(path.join(APP_DIR, rel))).toBe(false);
        });
    }
});

describe('app/archive — legacy XUL directory not referenced by live code', () => {
    test('no live app source file references the archive/ directory', () => {
        const violations = appSourceFiles.filter(fp => {
            const content = fs.readFileSync(fp, 'utf8');
            return /['"\/]archive\//.test(content) || /require.*archive\//.test(content);
        });
        expect(violations).toEqual([]);
    });
});
