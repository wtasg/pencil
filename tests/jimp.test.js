// Test Jimp (sharp-based) image processing module
// This tests the jimp shim that uses sharp internally

const path = require('path');
const fs = require('fs');
const os = require('os');

// Use the shim that uses sharp
const jimp = require('../app/lib/jimp-shim');

describe('Jimp Image Processing (Sharp backend)', () => {
    
    test('jimp can be required', () => {
        expect(jimp).toBeDefined();
        expect(typeof jimp.read).toBe('function');
    });

    test('can read image from buffer', (done) => {
        // Create a simple PNG buffer (1x1 white pixel)
        const buffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        
        jimp.read(buffer, function (err, image) {
            expect(err).toBeNull();
            expect(image.bitmap.width).toBe(1);
            expect(image.bitmap.height).toBe(1);
            done();
        });
    });

    test('can get buffer', (done) => {
        const tmpFile = path.join(os.tmpdir(), 'test_jimp_' + Date.now() + '.png');
        
        // First create a temp image using sharp directly
        const sharp = require('sharp');
        sharp({
            create: {
                width: 10,
                height: 10,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        })
        .png()
        .toFile(tmpFile)
        .then(() => {
            jimp.read(tmpFile, function (err, image) {
                image.getBuffer(jimp.AUTO, function (err, buffer) {
                    expect(err).toBeNull();
                    expect(buffer).toBeDefined();
                    expect(buffer.length).toBeGreaterThan(0);
                    fs.unlinkSync(tmpFile);
                    done();
                });
            });
        })
        .catch(done);
    }, 10000);

    test('can get base64', (done) => {
        const tmpFile = path.join(os.tmpdir(), 'test_jimp_' + Date.now() + '.png');
        
        const sharp = require('sharp');
        sharp({
            create: {
                width: 10,
                height: 10,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        })
        .png()
        .toFile(tmpFile)
        .then(() => {
            jimp.read(tmpFile, function (err, image) {
                image.getBase64(jimp.AUTO, function (err, base64) {
                    expect(err).toBeNull();
                    expect(base64).toMatch(/^data:image\/png;base64,/);
                    fs.unlinkSync(tmpFile);
                    done();
                });
            });
        })
        .catch(done);
    }, 10000);

    test('can rotate image', (done) => {
        const tmpFile = path.join(os.tmpdir(), 'test_jimp_' + Date.now() + '.png');
        
        const sharp = require('sharp');
        sharp({
            create: {
                width: 10,
                height: 20,
                channels: 4,
                background: { r: 255, g: 0, b: 0, alpha: 1 }
            }
        })
        .png()
        .toFile(tmpFile)
        .then(() => {
            jimp.read(tmpFile, function (err, image) {
                image.rotate(90, false, function (err, rotated) {
                    expect(err).toBeNull();
                    expect(rotated.bitmap.width).toBe(20);
                    expect(rotated.bitmap.height).toBe(10);
                    fs.unlinkSync(tmpFile);
                    done();
                });
            });
        })
        .catch(done);
    }, 10000);
});
