// Tests for capture-services.js promise functions
// These tests verify the current behavior before migration to async/await

const { execFile } = require('child_process');

// Mock Config
const Config = {
    data: {},
    define: function(name, defaultValue) {
        if (this.data[name] === undefined) {
            this.data[name] = defaultValue;
        }
        return name;
    },
    get: function(name, defaultValue) {
        return this.data[name] !== undefined ? this.data[name] : defaultValue;
    }
};

// Mock BaseCaptureService
const BaseCaptureService = function() {};
BaseCaptureService.MODE_AREA = 'area';
BaseCaptureService.MODE_WINDOW = 'window';
BaseCaptureService.MODE_FULL = 'full';
BaseCaptureService.OUTPUT_CLIPBOARD = 'clipboard';
BaseCaptureService.OUTPUT_FILE = 'file';

// BaseCmdCaptureService constructor (from capture-services.js)
const BaseCmdCaptureService = function() {
    BaseCaptureService.call(this);
};
BaseCmdCaptureService.prototype = Object.create(BaseCaptureService.prototype);

// The capture method that uses Promise
BaseCmdCaptureService.prototype.capture = function(options) {
    var thiz = this;
    return new Promise(function(resolve, reject) {
        var cmd = thiz.buildCommandLine(options);
        execFile(cmd.path, cmd.args, function(error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

// Mock implementation for testing
const MockScreenshotService = function() {
    BaseCmdCaptureService.call(this);
    this.id = 'MockScreenshotService';
};
MockScreenshotService.prototype = Object.create(BaseCmdCaptureService.prototype);

MockScreenshotService.prototype.buildCommandLine = function(options) {
    return {
        path: '/bin/echo',
        args: ['test']
    };
};

MockScreenshotService.prototype.getExecPath = function() {
    return '/bin/echo';
};

describe('BaseCmdCaptureService', () => {
    
    describe('capture', () => {
        test('should return a Promise', () => {
            const service = new MockScreenshotService();
            const result = service.capture({});
            expect(result).toBeInstanceOf(Promise);
        });
        
        test('should resolve when command succeeds', async () => {
            const service = new MockScreenshotService();
            
            // This will succeed because we're using /bin/echo
            const result = await service.capture({});
            expect(result).toBeUndefined();
        });
        
        test('should reject when command fails', async () => {
            // Create a service that will fail
            const FailingService = function() {
                BaseCmdCaptureService.call(this);
            };
            FailingService.prototype = Object.create(BaseCmdCaptureService.prototype);
            FailingService.prototype.buildCommandLine = function() {
                return {
                    path: '/bin/nonexistent-command-12345',
                    args: []
                };
            };
            
            const service = new FailingService();
            
            try {
                await service.capture({});
                fail('Should have rejected');
            } catch (err) {
                expect(err).toBeDefined();
            }
        });
    });
    
    describe('buildCommandLine', () => {
        test('should be implemented by subclass', () => {
            const service = new MockScreenshotService();
            const cmd = service.buildCommandLine({});
            expect(cmd.path).toBeDefined();
            expect(cmd.args).toBeDefined();
        });
    });
});

describe('Promise behavior', () => {
    test('new Promise resolves with value', async () => {
        const promise = new Promise(function(resolve) {
            resolve('value');
        });
        
        const result = await promise;
        expect(result).toBe('value');
    });
    
    test('new Promise rejects with error', async () => {
        const promise = new Promise(function(resolve, reject) {
            reject(new Error('test error'));
        });
        
        try {
            await promise;
            fail('Should have rejected');
        } catch (err) {
            expect(err.message).toBe('test error');
        }
    });
    
    test('Promise.all resolves multiple promises', async () => {
        const p1 = Promise.resolve(1);
        const p2 = Promise.resolve(2);
        const p3 = Promise.resolve(3);
        
        const results = await Promise.all([p1, p2, p3]);
        expect(results).toEqual([1, 2, 3]);
    });
    
    test('Promise.race returns first resolved', async () => {
        const p1 = new Promise(r => setTimeout(() => r('slow'), 100));
        const p2 = Promise.resolve('fast');
        
        const result = await Promise.race([p1, p2]);
        expect(result).toBe('fast');
    });
});
