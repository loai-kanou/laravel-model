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
exports.ModelCodeActions = void 0;
const vscode = __importStar(require("vscode"));
class ModelCodeActions {
    getProps;
    static providedCodeActionKinds = [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Refactor];
    constructor(getProps) {
        this.getProps = getProps;
    }
    provideCodeActions(doc, range) {
        const props = this.getProps(doc);
        if (!props)
            return;
        const actions = [];
        // Quick add attribute to $fillable
        const word = doc.getText(doc.getWordRangeAtPosition(range.start, /[A-Za-z_][A-Za-z0-9_]*/));
        if (word) {
            actions.push(this.replaceArrayAction(doc, '$fillable', word, "Add to $fillable"));
            actions.push(this.replaceArrayAction(doc, '$hidden', word, "Add to $hidden"));
            actions.push(this.replaceArrayAction(doc, '$appends', word, "Add to $appends"));
        }
        // Convert guarded ['*'] -> scaffold fillable
        if (props.guarded && props.guarded.length === 1 && props.guarded[0] === '*') {
            const a = new vscode.CodeAction("Convert $guarded=['*'] to explicit $fillable", vscode.CodeActionKind.Refactor);
            a.edit = new vscode.WorkspaceEdit();
            const text = doc.getText();
            const idx = text.indexOf('$guarded');
            if (idx >= 0) {
                const start = doc.positionAt(idx);
                const end = doc.positionAt(text.indexOf(';', idx) + 1);
                a.edit.replace(doc.uri, new vscode.Range(start, end), `protected $fillable = [/* TODO: add attributes */];`);
                actions.push(a);
            }
        }
        return actions;
    }
    replaceArrayAction(doc, varName, key, title) {
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        const text = doc.getText();
        const idx = text.indexOf(`$${varName}`);
        action.edit = new vscode.WorkspaceEdit();
        if (idx >= 0) {
            const start = doc.positionAt(idx);
            const end = doc.positionAt(text.indexOf('];', idx) + 2);
            const current = text.slice(idx, text.indexOf('];', idx) + 2);
            const insert = current.replace(/\[(.*?)\]/s, (m, g1) => {
                const items = (g1 || '').trim();
                const prefix = items.length ? items + ', ' : '';
                return `[${prefix}'${key}']`;
            });
            action.edit.replace(doc.uri, new vscode.Range(start, end), insert);
        }
        else {
            // create new property
            action.edit.insert(doc.uri, new vscode.Position(1, 0), `\nprotected $${varName} = ['${key}'];\n`);
        }
        return action;
    }
}
exports.ModelCodeActions = ModelCodeActions;
//# sourceMappingURL=codeActions.js.map