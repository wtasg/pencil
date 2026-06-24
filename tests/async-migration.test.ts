// Tests for async/await migrated code - verifying the patterns work correctly

describe('Async/Await Patterns from Migration', () => {
    
    describe('extractCollection pattern - async function with zip.extractAllToAsync', () => {
        test('async function wraps callback-based extraction', async () => {
            const mockZip = {
                extractAllToAsync: jest.fn((targetDir, overwrite, callback) => {
                    setTimeout(() => callback(null), 10);
                })
            };

            async function extractCollection(file) {
                return (async function() {
                    const targetDir = '/tmp/test';
                    try {
                        await new Promise(function(resolve, reject) {
                            mockZip.extractAllToAsync(targetDir, true, function(err) {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                        return targetDir;
                    } catch (err) {
                        throw err;
                    }
                })();
            }

            const result = await extractCollection({});
            expect(result).toBe('/tmp/test');
            expect(mockZip.extractAllToAsync).toHaveBeenCalled();
        });

        test('async function handles extraction error', async () => {
            const mockZip = {
                extractAllToAsync: jest.fn((targetDir, overwrite, callback) => {
                    setTimeout(() => callback(new Error('Extraction failed')), 10);
                })
            };

            async function extractCollection(file) {
                return (async function() {
                    const targetDir = '/tmp/test';
                    try {
                        await new Promise(function(resolve, reject) {
                            mockZip.extractAllToAsync(targetDir, true, function(err) {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                        return targetDir;
                    } catch (err) {
                        throw err;
                    }
                })();
            }

            await expect(extractCollection({})).rejects.toThrow('Extraction failed');
        });
    });

    describe('installCollection pattern - async function with try/catch', () => {
        test('async function with try/catch for sync operations', async () => {
            async function installCollection(targetDir) {
                return (async function() {
                    try {
                        const definitionFile = targetDir + '/definition.xml';
                        if (!definitionFile) {
                            throw new Error('collection.specification.is.not.found.in.the.archive');
                        }
                        return { id: 'test-collection', path: targetDir };
                    } catch (err) {
                        throw err;
                    }
                })();
            }

            const result = await installCollection('/tmp/collection');
            expect(result.id).toBe('test-collection');
        });

        test('async function throws when definition not found', async () => {
            async function installCollection(targetDir) {
                return (async function() {
                    try {
                        const definitionFile = null;
                        if (!definitionFile) {
                            throw new Error('collection.specification.is.not.found.in.the.archive');
                        }
                        return { id: 'test-collection' };
                    } catch (err) {
                        throw err;
                    }
                })();
            }

            await expect(installCollection('/tmp/empty'))
                .rejects.toThrow('collection.specification.is.not.found.in.the.archive');
        });

        test('async function handles duplicate collection error', async () => {
            const existingCollections = [{ id: 'existing-collection' }];

            async function installCollection(targetDir) {
                return (async function() {
                    try {
                        const definitionFile = '/tmp/definition.xml';
                        const newCollection = { id: 'existing-collection' };
                        
                        for (const existing of existingCollections) {
                            if (existing.id === newCollection.id) {
                                throw new Error('collection.named.already.installed');
                            }
                        }
                        return newCollection;
                    } catch (err) {
                        throw err;
                    }
                })();
            }

            await expect(installCollection('/tmp/collection'))
                .rejects.toThrow('collection.named.already.installed');
        });
    });

    describe('loadCollections pattern - async function with nugget download', () => {
        test('async function wraps nugget callback', async () => {
            const mockNugget = jest.fn((url, opts, callback) => {
                setTimeout(() => callback(null), 10);
            });

            async function loadCollections(url) {
                return (async function() {
                    try {
                        await new Promise(function(resolve, reject) {
                            mockNugget(url, {}, function(errors) {
                                if (errors) reject(errors[0]);
                                else resolve();
                            });
                        });
                        return { collections: [] };
                    } catch (err) {
                        throw err;
                    }
                })();
            }

            const result = await loadCollections('http://example.com/repo.xml');
            expect(result.collections).toEqual([]);
            expect(mockNugget).toHaveBeenCalled();
        });

        test('async function handles nugget error', async () => {
            const mockNugget = jest.fn((url, opts, callback) => {
                callback([{ message: 'Download failed' }]);
            });

            async function loadCollections(url) {
                return (async function() {
                    await new Promise(function(resolve, reject) {
                        mockNugget(url, {}, function(errors) {
                            if (errors) reject(errors[0]);
                            else resolve();
                        });
                    });
                    return { collections: [] };
                })();
            }

            try {
                await loadCollections('http://example.com/repo.xml');
                fail('Should have thrown');
            } catch (err) {
                expect(err.message).toBe('Download failed');
            }
        });

        test('async function handles 404 error', async () => {
            const mockNugget = jest.fn((url, opts, callback) => {
                callback([{ message: '404 Not Found' }]);
            });

            async function loadCollections(url) {
                return (async function() {
                    await new Promise(function(resolve, reject) {
                        mockNugget(url, {}, function(errors) {
                            if (errors) {
                                const error = errors[0];
                                if (error.message.indexOf('404') === -1) {
                                    return reject(error);
                                }
                                return reject(error);
                            }
                            resolve();
                        });
                    });
                    return { collections: [] };
                })();
            }

            try {
                await loadCollections('http://example.com/notfound.xml');
                fail('Should have thrown');
            } catch (err) {
                expect(err.message).toBe('404 Not Found');
            }
        });
    });

    describe('BaseCmdCaptureService.capture pattern - async function with execFile', () => {
        test('async function wraps execFile', async () => {
            const mockExecFile = jest.fn((path, args, callback) => {
                callback(null);
            });

            async function capture(options) {
                return (async function() {
                    const cmd = { path: '/bin/echo', args: ['test'] };
                    await new Promise(function(resolve, reject) {
                        mockExecFile(cmd.path, cmd.args, function(error) {
                            if (error) reject(error);
                            else resolve();
                        });
                    });
                })();
            }

            await expect(capture({})).resolves.toBeUndefined();
            expect(mockExecFile).toHaveBeenCalledWith('/bin/echo', ['test'], expect.any(Function));
        });

        test('async function handles execFile error', async () => {
            const mockExecFile = jest.fn((path, args, callback) => {
                callback(new Error('Command failed'));
            });

            async function capture(options) {
                return (async function() {
                    const cmd = { path: '/bin/false', args: [] };
                    await new Promise(function(resolve, reject) {
                        mockExecFile(cmd.path, cmd.args, function(error) {
                            if (error) reject(error);
                            else resolve();
                        });
                    });
                })();
            }

            await expect(capture({})).rejects.toThrow('Command failed');
        });
    });

    describe('General async/await patterns', () => {
        test('IIFE async function returns a promise', () => {
            const result = (async function() {
                return 'value';
            })();
            
            expect(result).toBeInstanceOf(Promise);
        });

        test('async function with callback parameter', async () => {
            let callbackCalled = false;
            
            async function operation(param, callback) {
                return (async function() {
                    try {
                        const result = param * 2;
                        if (callback) callback(null, result);
                        return result;
                    } catch (err) {
                        if (callback) callback(err);
                        throw err;
                    }
                })();
            }

            const result = await operation(5, (err, val) => {
                callbackCalled = true;
                expect(val).toBe(10);
            });
            expect(result).toBe(10);
            expect(callbackCalled).toBe(true);
        });

        test('async function with callback on error', async () => {
            let errorCallbackCalled = false;
            
            async function operation(param, callback) {
                return (async function() {
                    try {
                        throw new Error('test error');
                    } catch (err) {
                        if (callback) callback(err);
                        throw err;
                    }
                })();
            }

            await expect(operation(5, (err) => {
                errorCallbackCalled = true;
            })).rejects.toThrow('test error');
            
            expect(errorCallbackCalled).toBe(true);
        });

        test('await Promise.all for parallel operations', async () => {
            async function delay(ms) {
                return new Promise(resolve => setTimeout(() => resolve(ms), ms));
            }
            
            const results = await Promise.all([delay(10), delay(5), delay(15)]);
            expect(results).toEqual([10, 5, 15]);
        });

        test('await with nested Promise callback pattern', async () => {
            const mockParser = {
                parseFile: jest.fn((filepath, callback) => {
                    setTimeout(() => callback({ data: 'parsed' }), 10);
                })
            };

            async function parseFile(filepath) {
                return await new Promise(function(resolve) {
                    mockParser.parseFile(filepath, (data) => {
                        resolve(data);
                    });
                });
            }

            const result = await parseFile('/tmp/test.xml');
            expect(result.data).toBe('parsed');
        });
    });
});
