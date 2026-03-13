// Tests for Phase 4: Utilities/External Layer Promise Patterns
// Tests for FontLoader.js, FontLoaderUtil.js, webPrinter.js, etc.

describe('Phase 4: Utilities/External Layer Promise Patterns', () => {

    describe('FontLoaderUtil.js patterns', () => {

        // Pattern: Promise.ready -> await Promise.ready
        test('await Promise.ready property', async () => {
            const fontFace = { name: 'MyFont', style: 'normal', weight: '400' };
            const readyPromise = new Promise(resolve => setTimeout(() => resolve(fontFace), 10));

            const mockFontAddResult = {
                ready: readyPromise
            };

            let loadedCss = null;
            const documentFonts = {
                load: async (css) => {
                    loadedCss = css;
                }
            };

            async function loadFontWithReady() {
                try {
                    await mockFontAddResult.ready;
                    const css = `${fontFace.style} ${fontFace.weight} 1em '${fontFace.name}'`;
                    await documentFonts.load(css);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            const success = await loadFontWithReady();
            expect(success).toBe(true);
            expect(loadedCss).toBe("normal 400 1em 'MyFont'");
        });
    });

    describe('webPrinter.js patterns', () => {

        // Pattern: util.promisify for fs.writeFile
        test('util.promisify wrapping fs.writeFile', async () => {
            const mockFs = {
                writeFile: (path, data, callback) => {
                    setTimeout(() => {
                        if (path === '/error/path') {
                            callback(new Error('Write failed'));
                        } else {
                            callback(null);
                        }
                    }, 5);
                }
            };

            const util = require('util');
            const writeFileAsync = util.promisify(mockFs.writeFile);

            // Test success
            try {
                await writeFileAsync('/good/path', 'data');
                expect(true).toBe(true); // Should reach here
            } catch (e) {
                throw new Error('Should not have thrown');
            }

            // Test failure
            try {
                await writeFileAsync('/error/path', 'data');
                throw new Error('Should have thrown');
            } catch (e) {
                expect(e.message).toBe('Write failed');
            }
        });

        // Pattern: async IIFE for operations
        test('async IIFE execution', async () => {
            let log = [];

            const result = await (async function() {
                log.push('start');
                const delay = (ms) => new Promise(res => setTimeout(res, ms));
                await delay(5);
                log.push('middle');
                await delay(5);
                log.push('end');
                return log.join('-');
            })();

            expect(result).toBe('start-middle-end');
            expect(log.length).toBe(3);
        });
    });

    describe('SettingDialog / Dialog patterns', () => {

        // Pattern: Promisified Dialog confirmation wrapper
        test('Promisified Dialog.confirm', async () => {
            const Dialog = {
                confirm: (title, msg, yesBtn, yesCb, noBtn, noCb) => {
                    if (title === 'Error') {
                        setTimeout(noCb, 5);
                    } else {
                        setTimeout(yesCb, 5);
                    }
                }
            };

            const util = require('util');
            const confirmAsync = util.promisify((title, cb) => {
                Dialog.confirm(title, '', 'Yes', () => cb(null, true), 'No', () => cb(null, false));
            });

            const yesResult = await confirmAsync('Success');
            expect(yesResult).toBe(true);

            const noResult = await confirmAsync('Error');
            expect(noResult).toBe(false);
        });
    });

});
