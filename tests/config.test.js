// Test configuration module

const path = require('path');
const os = require('os');
const fs = require('fs');

// Mock implementations for testing
const mockFs = {
    existsSync: () => true,
    mkdirSync: () => {},
    writeFileSync: () => {},
    readFileSync: () => '{}'
};

const Config = {
    data: {},
    DATA_DIR_NAME: ".pencil",
    CONFIG_FILE_NAME: "config.json",

    getDataPath: function() {
        return path.join(os.homedir(), this.DATA_DIR_NAME);
    },

    getDataFilePath: function(name) {
        return path.join(this.getDataPath(), name);
    },

    set: function(name, value) {
        this.data[name] = value;
    },

    get: function(name, defaultValue) {
        return typeof this.data[name] !== 'undefined' ? this.data[name] : defaultValue;
    },

    define: function(name, defaultValue) {
        if (this.get(name, null) === null) {
            this.set(name, defaultValue);
        }
        return name;
    }
};

describe('Config', () => {
    test('getDataPath returns correct path', () => {
        const dataPath = Config.getDataPath();
        expect(dataPath).toContain('.pencil');
    });

    test('get returns default value for undefined key', () => {
        expect(Config.get('nonexistent', 'default')).toBe('default');
    });

    test('set and get work correctly', () => {
        Config.set('testKey', 'testValue');
        expect(Config.get('testKey')).toBe('testValue');
    });

    test('define sets default value only once', () => {
        Config.define('newKey', 'defaultValue');
        expect(Config.get('newKey')).toBe('defaultValue');
        
        Config.set('newKey', 'modifiedValue');
        Config.define('newKey', 'defaultValue');
        expect(Config.get('newKey')).toBe('modifiedValue');
    });
});
