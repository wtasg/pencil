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

    await new Promise((resolve, reject) => {
        zip.extractAllToAsync(Pencil.documentHandler.tempDir.name, true, function(err) {
            if (err) {
                reject(new Error("File could not be loaded: " + err));
            } else {
                resolve();
            }
        });
    });

    await new Promise((resolve) => {
        this.parseDocument(filePath, resolve);
    });
};

/*
EpzHandler.prototype.saveDocument = function (documentPath, callback) {
    var thiz = this;

    return new Promise(function (resolve, reject) {
        var easyZip = require("easy-zip2").EasyZip;
        var zip = new easyZip();
        zip.zipFolder(Pencil.documentHandler.tempDir.name + "/.", function (err) {
            if (err) {
                reject(new Error("Unable to save file: " + err));
            } else {
                try {
                    zip.writeToFile(documentPath, function (err) {
                        if (err) {
                            reject(new Error("Unable to save file: " + err));
                        } else {
                            resolve();
                        }
                    });
                } catch (e) {
                    reject(e);
                }
            }
        });
    });
};
*/