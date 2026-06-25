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

// Common globals that may not be typed
declare var req: any;
declare var dumpError: any;
declare var QueueHandler: any;
