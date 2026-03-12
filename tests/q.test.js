// Test Q Promise Shim
// Tests the Q-compatible shim using native Promises

const Q = require('../app/lib/q-shim');

describe('Q Promise Shim', () => {
    
    test('Q.Promise creates a native Promise', (done) => {
        const promise = Q.Promise(function(resolve, reject) {
            resolve('test');
        });
        
        expect(promise).toBeInstanceOf(Promise);
        promise.then(result => {
            expect(result).toBe('test');
            done();
        });
    });

    test('Q.Promise resolves correctly', (done) => {
        Q.Promise(function(resolve, reject) {
            resolve('hello');
        })
        .then(result => {
            expect(result).toBe('hello');
            done();
        });
    });

    test('Q.Promise rejects correctly', (done) => {
        Q.Promise(function(resolve, reject) {
            reject(new Error('error'));
        })
        .catch(err => {
            expect(err.message).toBe('error');
            done();
        });
    });

    test('Q.resolve creates resolved promise', (done) => {
        Q.resolve('value')
        .then(result => {
            expect(result).toBe('value');
            done();
        });
    });

    test('Q.reject creates rejected promise', (done) => {
        Q.reject('error')
        .catch(err => {
            expect(err).toBe('error');
            done();
        });
    });

    test('Q.all resolves multiple promises', (done) => {
        const p1 = Promise.resolve(1);
        const p2 = Promise.resolve(2);
        const p3 = Promise.resolve(3);
        
        Q.all([p1, p2, p3])
        .then(results => {
            expect(results).toEqual([1, 2, 3]);
            done();
        });
    });

    test('Q.defer provides promise, resolve, reject', () => {
        const deferred = Q.defer();
        
        expect(deferred.promise).toBeInstanceOf(Promise);
        expect(typeof deferred.resolve).toBe('function');
        expect(typeof deferred.reject).toBe('function');
    });

    test('Q.defer resolve works', (done) => {
        const deferred = Q.defer();
        
        deferred.promise.then(result => {
            expect(result).toBe('deferred value');
            done();
        });
        
        deferred.resolve('deferred value');
    });

    test('Q.defer reject works', (done) => {
        const deferred = Q.defer();
        
        deferred.promise.catch(err => {
            expect(err).toBe('deferred error');
            done();
        });
        
        deferred.reject('deferred error');
    });

    test('Q.promisify wraps function', (done) => {
        function add(a, b) {
            return a + b;
        }
        
        const promisifiedAdd = Q.promisify(add);
        
        promisifiedAdd(2, 3)
        .then(result => {
            expect(result).toBe(5);
            done();
        });
    });
});
