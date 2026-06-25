// Type definitions for Electron and project-specific globals

declare namespace Electron {
    interface App { }
    interface BrowserWindow { }
}

// Firefox/Xul components for legacy code
declare var Components: any;

// Pencil-specific globals
declare namespace Pencil {
    interface PencilNamespace extends Window {
        [key: string]: any;
    }
}

declare var Pencil: any;
declare var PencilNamespace: any;
declare var PencilNamespaces: any;
PencilNamespaces["p"] = "http://www.evolus.vn/Namespace/Pencil";
PencilNamespaces["svg"] = "http://www.w3.org/2000/svg";
PencilNamespaces["xlink"] = "http://www.w3.org/1999/xlink";
PencilNamespaces["xul"] = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
PencilNamespaces["html"] = "http://www.w3.org/1999/xhtml";
PencilNamespaces["xbl"] = "http://www.mozilla.org/xbl";

PencilNamespaces["inkscape"] = "http://www.inkscape.org/namespaces/inkscape";
PencilNamespaces["dc"] = "http://purl.org/dc/elements/1.1/";
PencilNamespaces["cc"] = "http://creativecommons.org/ns#";
PencilNamespaces["rcc"] = "http://web.resource.org/cc/";

PencilNamespaces["rdf"] = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
PencilNamespaces["sodipodi"] = "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd";

PencilNamespaces["content"] = "http://purl.org/rss/1.0/modules/content/";
PencilNamespaces["itunes"] = "http://www.itunes.com/dtds/podcast-1.0.dtd";
PencilNamespaces["media"] = "http://search.yahoo.com/mrss/";
PencilNamespaces["atom"] = "http://www.w3.org/2005/Atom";

// Common globals that may not be typed
declare var req: any;
declare var dumpError: any;
declare var QueueHandler: any;


declare type CollectionManager = {
    shapeDefinition: {
        collections: Array<any>;
        shapeDefMap: Record<any, any>;
        shortcutMap: Record<any, any>;
    }
};

declare const CollectionManager: CollectionManager;

declare type UtilType = {
    _calculatedEM: any;
    beginProgressJob: any;
    compareVersion: any;
    compress: any;
    confirm: any;
    confirmExtra: any;
    confirmWithWarning: any;
    dialog: any;
    em: any;
    enumInterfaces: any;
    error: any;
    fontList: any;
    generateIcon: any;
    getClipboardImage: any;
    getCustomNumberProperty: any;
    getCustomProperty: any;
    getFileExtension: any;
    getInstanceToken: any;
    getMessage: any;
    getNodeMetadata: any;
    getXulrunnerVersion: any;
    goDoCommand: any;
    gridNormalize: any;
    handleTempImageLoad: any;
    handleTempImageLoadImpl: any;
    hideStatusbarMessage: any;
    imageOnloadListener: any;
    importSandboxFunctions: any;
    info: any;
    initTextMetricFrame: any;
    instanceToken: any;
    ios: any;
    isDev: any;
    isMac: any;
    isXul17OrLater: any;
    isXul6OrLater: any;
    isXulrunner: any;
    newUUID: any;
    openDonate: any;
    platform: any;
    preloadFonts: any;
    setCustomProperty: any;
    setNodeMetadata: any;
    setPointerPosition: any;
    setupImage: any;
    showNotification: any;
    showStatusBarError: any;
    showStatusBarInfo: any;
    showStatusBarWarning: any;
    STATUSBAR_MESSAGE_AUTOHIDE: any;
    statusbarDisplay: any;
    statusbarPointer: any;
    uuidGenerator: any;
    warn: any;
    workOnListAsync: any;
};

declare type UICommandManager = {
    getCommand: (a: string) => { key: string, shortcut: string, run: () => void };
};

declare const UICommandManager: UICommandManager;