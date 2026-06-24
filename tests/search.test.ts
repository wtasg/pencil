// Test SearchEngine and SearchManager

function SearchEngine() {
    this.title = null;
    this.name = null;
    this.icon = null;
    this.description = null;
    this.uri = null;
}

SearchEngine.prototype.search = function(query, options, callback) {
    return this.searchImpl(query, options, callback);
}

var SearchManager = {
    engines: [],
    registerSearchEngine: function(engine, isDefault) {
        this.engines.push(engine);
    },
    getEngine: function(name) {
        return this.engines.find(e => e.name === name);
    }
};

describe('SearchEngine', () => {
    test('SearchEngine can be instantiated', () => {
        const engine = new SearchEngine();
        expect(engine).toBeDefined();
        expect(engine.title).toBeNull();
        expect(engine.name).toBeNull();
    });
});

describe('SearchManager', () => {
    test('registerSearchEngine adds engine to list', () => {
        SearchManager.engines = [];
        const mockEngine = { name: 'test-engine', title: 'Test Engine' };
        SearchManager.registerSearchEngine(mockEngine, true);
        expect(SearchManager.engines.length).toBe(1);
        expect(SearchManager.engines[0]).toEqual(mockEngine);
    });

    test('getEngine returns correct engine by name', () => {
        SearchManager.engines = [];
        const engine1 = { name: 'engine1', title: 'Engine 1' };
        const engine2 = { name: 'engine2', title: 'Engine 2' };
        SearchManager.registerSearchEngine(engine1, true);
        SearchManager.registerSearchEngine(engine2, false);
        
        const found = SearchManager.getEngine('engine2');
        expect(found).toEqual(engine2);
    });

    test('getEngine returns undefined for unknown engine', () => {
        SearchManager.engines = [];
        const result = SearchManager.getEngine('nonexistent');
        expect(result).toBeUndefined();
    });
});
