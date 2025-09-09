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
exports.syncDocblocks = syncDocblocks;
const vscode = __importStar(require("vscode"));
async function syncDocblocks(doc, props) {
    const edit = new vscode.WorkspaceEdit();
    const headerPos = new vscode.Position(0, 0);
    const block = buildDocblock(props);
    edit.insert(doc.uri, headerPos, block);
    await vscode.workspace.applyEdit(edit);
}
function buildDocblock(props) {
    const attrs = new Set([
        ...props.fillable,
        ...Object.keys(props.casts),
        ...props.hidden,
        ...props.appends
    ]);
    const lines = ["/**"];
    for (const a of Array.from(attrs).sort()) {
        lines.push(` * @property mixed $${a}`);
    }
    for (const [name, kind] of Object.entries(props.relations)) {
        lines.push(` * @method static \\Illuminate\\Database\\Eloquent\\Relations\\${mapRel(kind)} ${name}()`);
    }
    lines.push(" */\n");
    return lines.join("\n");
}
function mapRel(k) {
    const map = {
        hasOne: 'HasOne', hasMany: 'HasMany', belongsTo: 'BelongsTo', belongsToMany: 'BelongsToMany',
        morphOne: 'MorphOne', morphMany: 'MorphMany', morphTo: 'MorphTo', morphToMany: 'MorphToMany'
    };
    return map[k] ?? 'Relation';
}
//# sourceMappingURL=docblocks.js.map