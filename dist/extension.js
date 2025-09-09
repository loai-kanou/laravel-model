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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const indexer_1 = require("./indexer");
const modelParser_1 = require("./modelParser");
const diagnostics_1 = require("./diagnostics");
const codeActions_1 = require("./codeActions");
const codeLens_1 = require("./codeLens");
const docblocks_1 = require("./docblocks");
const collection = vscode.languages.createDiagnosticCollection('laravel-models');
const index = new indexer_1.ModelIndex();
const lenses = new codeLens_1.ModelLensProvider();
async function activate(context) {
    await index.indexWorkspace();
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(onDocChanged), vscode.workspace.onDidOpenTextDocument(onDocChanged), vscode.workspace.onDidChangeTextDocument(e => onDocChanged(e.document)), vscode.languages.registerCodeActionsProvider('php', new codeActions_1.ModelCodeActions(doc => parseModelSafe(doc)), {
        providedCodeActionKinds: codeActions_1.ModelCodeActions.providedCodeActionKinds
    }), vscode.languages.registerCodeLensProvider({ language: 'php' }, lenses), vscode.commands.registerCommand('laravelModels.scanWorkspace', async () => {
        await index.indexWorkspace();
        refreshVisible();
        vscode.window.showInformationMessage('Laravel Models re-indexed.');
    }), vscode.commands.registerCommand('laravelModels.generateFillable', async () => {
        const doc = vscode.window.activeTextEditor?.document;
        if (!doc)
            return;
        const props = parseModelSafe(doc);
        if (!props)
            return;
        if (props.fillable.length > 0) {
            vscode.window.showInformationMessage('Model already has $fillable. Edit manually or use Quick Fixes.');
            return;
        }
        const used = extractUsedAttrs(doc);
        if (used.size === 0) {
            vscode.window.showWarningMessage('No mass-assignment usage detected. Add manually or enable DB-aware mode.');
            return;
        }
        const edit = new vscode.WorkspaceEdit();
        edit.insert(doc.uri, new vscode.Position(1, 0), `\nprotected $fillable = [${Array.from(used).map(a => `'${a}'`).join(', ')}];\n`);
        await vscode.workspace.applyEdit(edit);
    }), vscode.commands.registerCommand('laravelModels.syncDocblocks', async () => {
        const doc = vscode.window.activeTextEditor?.document;
        if (!doc)
            return;
        const props = parseModelSafe(doc);
        if (!props)
            return;
        await (0, docblocks_1.syncDocblocks)(doc, props);
        vscode.window.showInformationMessage('DocBlocks synced.');
    }));
    refreshVisible();
}
function parseModelSafe(doc) {
    try {
        return (0, modelParser_1.parseModel)(doc);
    }
    catch {
        return null;
    }
}
function extractUsedAttrs(doc) {
    const text = doc.getText();
    const set = new Set();
    const re = /(create|update|fill)\s*\(\s*\[(.*?)\]\s*\)/gs;
    let m;
    while ((m = re.exec(text))) {
        for (const kv of m[2].split(',')) {
            const key = kv.match(/(['"])(.*?)\1\s*=>/)?.[2];
            if (key)
                set.add(key);
        }
    }
    return set;
}
async function onDocChanged(doc) {
    if (doc.languageId !== 'php')
        return;
    const props = parseModelSafe(doc);
    if (!props) {
        collection.delete(doc.uri);
        return;
    }
    const diags = (0, diagnostics_1.computeDiagnostics)(doc, props);
    collection.set(doc.uri, diags);
    lenses.setModel(doc.uri.fsPath, props);
}
function refreshVisible() {
    const ed = vscode.window.activeTextEditor?.document;
    if (ed)
        onDocChanged(ed);
}
function deactivate() {
    collection.clear();
}
//# sourceMappingURL=extension.js.map