// Jimp compatibility shim using sharp
// This allows existing code to work without major rewrites

const sharp = require('sharp');

const jimp = {
    AUTO: 'auto',
    RESIZE_BICUBIC: true,
    
    read: function(src, callback) {
        sharp(src)
            .raw()
            .ensureAlpha()
            .toBuffer({ resolveWithObject: true })
            .then(({ data, info }) => {
                const image = new JimpImage(info.width, info.height);
                image.bitmap.data = data;
                image.bitmap.width = info.width;
                image.bitmap.height = info.height;
                callback(null, image);
            })
            .catch(err => callback(err));
    }
};

class JimpImage {
    constructor(width, height, color = 0x00000000) {
        this.bitmap = {
            width: width,
            height: height,
            data: Buffer.alloc(width * height * 4)
        };
        this.quality = 100;
        this.rgba = true;
        
        // Fill with color if provided
        if (color !== undefined) {
            const r = (color >> 24) & 0xff;
            const g = (color >> 16) & 0xff;
            const b = (color >> 8) & 0xff;
            const a = color & 0xff;
            for (let i = 0; i < width * height; i++) {
                this.bitmap.data[i * 4] = r;
                this.bitmap.data[i * 4 + 1] = g;
                this.bitmap.data[i * 4 + 2] = b;
                this.bitmap.data[i * 4 + 3] = a;
            }
        }
    }
    
    getBuffer(mimeType, callback) {
        const format = mimeType === 'auto' || mimeType === jimp.AUTO ? 'png' : 
                      mimeType.replace('image/', '');
        const ext = format === 'jpeg' ? 'jpg' : format;
        const mime = `image/${format}`;
        
        sharp(this.bitmap.data, {
            raw: {
                width: this.bitmap.width,
                height: this.bitmap.height,
                channels: 4
            }
        })
        .png({ quality: this.quality })
        .toBuffer()
        .then(buffer => callback(null, buffer))
        .catch(err => callback(err));
    }
    
    getBase64(mimeType, callback) {
        const format = mimeType === 'auto' || mimeType === jimp.AUTO ? 'png' : 
                      mimeType.replace('image/', '');
        
        sharp(this.bitmap.data, {
            raw: {
                width: this.bitmap.width,
                height: this.bitmap.height,
                channels: 4
            }
        })
        .png({ quality: this.quality })
        .toBuffer()
        .then(buffer => {
            const base64 = `data:image/${format};base64,${buffer.toString('base64')}`;
            callback(null, base64);
        })
        .catch(err => callback(err));
    }
    
    getMIME() {
        return 'image/png';
    }
    
    rotate(degree, resize, callback) {
        if (typeof resize === 'function') {
            callback = resize;
            resize = false;
        }
        
        const that = this;
        sharp(this.bitmap.data, {
            raw: {
                width: this.bitmap.width,
                height: this.bitmap.height,
                channels: 4
            }
        })
        .rotate(degree, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
            const image = new JimpImage(info.width, info.height);
            image.bitmap.data = data;
            image.bitmap.width = info.width;
            image.bitmap.height = info.height;
            if (callback) callback(null, image);
        })
        .catch(err => {
            if (callback) callback(err);
        });
        
        return this;
    }
    
    quality(q) {
        this.quality = q;
        return this;
    }
    
    rgba(enable) {
        this.rgba = enable;
        return this;
    }
}

module.exports = jimp;
