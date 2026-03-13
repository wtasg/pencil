
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
