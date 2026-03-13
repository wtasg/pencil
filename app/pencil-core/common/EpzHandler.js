function EpzHandler (controller) {
    FileHandler.call(this);
    this.controller = controller;
    this.name = "Pencil Document (Compressed)";
    this.type = EpzHandler.EXT;
}
__extend(FileHandler, EpzHandler);

EpzHandler.EXT = ".epz";
EpzHandler.prototype.loadDocument = async function(filePath) {
    const admZip = require('adm-zip');
    const zip = new admZip(filePath);

    const util = require('util');
    const extractAsync = util.promisify(zip.extractAllToAsync.bind(zip));

    try {
        await extractAsync(Pencil.documentHandler.tempDir.name, true);
    } catch (err) {
        throw new Error("File could not be loaded: " + err);
    }

    const parseAsync = util.promisify((fp, cb) => {
        this.parseDocument(fp, function(result, err) {
            cb(err, result);
        });
    });

    return await parseAsync(filePath);
};

