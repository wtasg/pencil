// Q Promise Compatibility Shim
// Provides Q.Promise interface using native Promises
// This allows existing code to work without changes

const Q = {
    Promise: function(executor) {
        return new Promise(executor);
    },
    
    // Common Q methods that might be used
    defer: function() {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return {
            promise: promise,
            resolve: resolve,
            reject: reject
        };
    },
    
    resolve: function(value) {
        return Promise.resolve(value);
    },
    
    reject: function(reason) {
        return Promise.reject(reason);
    },
    
    all: function(promises) {
        return Promise.all(promises);
    },
    
    // Wrap a function to return a promise
    promisify: function(fn) {
        return function(...args) {
            return new Promise((resolve, reject) => {
                try {
                    const result = fn(...args);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        };
    }
};

module.exports = Q;
