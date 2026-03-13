function EpgzHandler(controller) {
    FileHandler.call(this);
    this.controller = controller;
    this.name = "Pencil Document (GZip Compressed)";
    this.type = EpgzHandler.EXT;
}

__extend(FileHandler, EpgzHandler);

EpgzHandler.EXT = ".epgz";
EpgzHandler.prototype.loadDocument = async function(filePath) {
    const zlib = require('zlib');
    const tarfs = require('tar-fs');
    const thiz = this;

    const parseAsync = require('util').promisify((fp, cb) => {
        thiz.parseDocument(fp, function(result, err) {
            cb(err, result);
        });
    });

    const streamPipeline = require('util').promisify(require('stream').pipeline);

    try {
        await streamPipeline(
            fs.createReadStream(filePath),
            zlib.Gunzip(),
            tarfs.extract(Pencil.documentHandler.tempDir.name, {readable: true, writable: true})
        );
        console.log("Successfully extracted.");
        return await parseAsync(filePath);
    } catch (error) {
        console.log(error);
        var recoverable = fs.existsSync(path.join(Pencil.documentHandler.tempDir.name, "content.xml"));
        if (!recoverable) {
            throw error;
        } else {
            ApplicationPane._instance.unbusy();

            const confirmAsync = require('util').promisify((msgTitle, msgBody, yesStr, noStr, cb) => {
                Dialog.confirm(msgTitle, msgBody, yesStr, function() {
                    cb(null, true);
                }, noStr, function() {
                    cb(null, false);
                });
            });

            const proceed = await confirmAsync(
                "File loading error", 
                "There was an error that prevented your document from being fully loaded. The document file seems to be corrupted.\n" +
                "Do you want Pencil to try loading the document anyway?",
                "Yes, try anyway", 
                "Cancel"
            );

            ApplicationPane._instance.busy();
            if (proceed) {
                return await parseAsync(filePath);
            } else {
                throw error;
            }
        }
    }
}

EpgzHandler.prototype.saveDocument = async function(documentPath) {
    const thiz = this;
    const targz = require('tar.gz');
    const tarOptions = {
        fromBase: true,
        readerFilter: function(one, two, three) {
            var p = one && one.path ? one.path : null;
            if (one && one.size === 0) {
                // console.log("Empty file found: ", p);
            }
            var re = process.platform === "win32" ? /refs\\([^\\]+)$/ : /refs\/([^\/]+)$/;
            if (p && p.match(re)) {
                var id = RegExp.$1;
                if (thiz.controller.registeredResourceIds && thiz.controller.registeredResourceIds.indexOf(id) < 0) {
                    console.log("Ignoring: " + id);
                    return false;
                }
            }
            return true;
        }
    };

    const compressor = new targz({}, tarOptions);
    console.log(compressor._options);
    const compressAsync = require('util').promisify(compressor.compress.bind(compressor));
    await compressAsync(Pencil.documentHandler.tempDir.name, documentPath);
};
