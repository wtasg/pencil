function EpgzHandler(controller) {
    FileHandler.call(this);
    this.controller = controller;
    this.name = "Pencil Document (GZip Compressed)";
    this.type = EpgzHandler.EXT;
}

__extend(FileHandler, EpgzHandler);

EpgzHandler.EXT = ".epgz";
EpgzHandler.prototype.loadDocument = async function(filePath) {
    const childProcess = require("node:child_process");
    const util = require("node:util");
    const thiz = this;

    const parseAsync = util.promisify((fp, cb) => {
        thiz.parseDocument(fp, function(result, err) {
            cb(err, result);
        });
    });
    const execFileAsync = util.promisify(childProcess.execFile);

    try {
        await execFileAsync("tar", ["-xzf", filePath, "-C", Pencil.documentHandler.tempDir.name]);
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
    const childProcess = require("node:child_process");
    const fs = require("node:fs");
    const path = require("node:path");
    const util = require("node:util");
    const execFileAsync = util.promisify(childProcess.execFile);

    const tempDirPath = Pencil.documentHandler.tempDir.name;
    const excludes = [];
    const refsDir = path.join(tempDirPath, "refs");

    if (fs.existsSync(refsDir) && this.controller.registeredResourceIds) {
        const resourceIdSet = new Set(this.controller.registeredResourceIds);
        const refs = fs.readdirSync(refsDir);
        for (const id of refs) {
            if (!resourceIdSet.has(id)) {
                console.log("Ignoring: " + id);
                excludes.push("./refs/" + id);
            }
        }
    }

    const args = ["-czf", documentPath];
    for (const excludedPath of excludes) {
        args.push("--exclude=" + excludedPath);
    }
    args.push(".");

    await execFileAsync("tar", args, { cwd: tempDirPath });
};
