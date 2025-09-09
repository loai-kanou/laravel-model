"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLensProvider = void 0;
const vscode = __importStar(require("vscode"));
class ModelLensProvider {
    onDidChangeEmitter = new vscode.EventEmitter();
    onDidChangeCodeLenses = this.onDidChangeEmitter.event;
    cache = new Map();
    setModel(fsPath, props) {
        if (!props)
            return;
        this.cache.set(fsPath, props);
        this.onDidChangeEmitter.fire();
    }
    provideCodeLenses(document) {
        const props = this.cache.get(document.uri.fsPath);
        if (!props)
            return [];
        const header = `fillable:${props.fillable.length} guarded:${props.guarded ? props.guarded.length : 0} casts:${Object.keys(props.casts).length} hidden:${props.hidden.length} appends:${props.appends.length} rel:${Object.keys(props.relations).length}`;
        const range = new vscode.Range(0, 0, 0, 1);
        return [
            new vscode.CodeLens(range, { title: header, command: '' }),
            new vscode.CodeLens(range, { title: "Generate $fillable", command: "laravelModels.generateFillable" }),
            new vscode.CodeLens(range, { title: "Sync DocBlocks", command: "laravelModels.syncDocblocks" })
        ];
    }
}
exports.ModelLensProvider = ModelLensProvider;
//# sourceMappingURL=codeLens.js.map