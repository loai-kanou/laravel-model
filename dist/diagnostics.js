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
exports.computeDiagnostics = computeDiagnostics;
const vscode = __importStar(require("vscode"));
function computeDiagnostics(doc, props) {
    const diags = [];
    if (!props)
        return diags;
    const full = doc.getText();
    // No fillable nor guarded
    if ((props.fillable.length === 0) && (props.guarded === null)) {
        diags.push(makeDiag(doc, 0, 1, "Model has neither $fillable nor $guarded. Mass-assignment behavior is ambiguous. Consider defining $fillable explicitly.", vscode.DiagnosticSeverity.Warning));
    }
    // guarded = ['*']
    if (props.guarded && props.guarded.length === 1 && props.guarded[0] === '*') {
        diags.push(makeDiag(doc, 0, 1, "Model uses $guarded = ['*'] (locks all). Prefer explicit $fillable for clarity.", vscode.DiagnosticSeverity.Information));
    }
    // Simple usage check: detect ->create([... 'foo' => ...]) attributes not in $fillable
    const usedAttrs = new Set();
    const createRE = /(create|update|fill)\s*\(\s*\[(.*?)\]\s*\)/gs;
    let m;
    while ((m = createRE.exec(full))) {
        const body = m[2];
        for (const kv of body.split(',')) {
            const key = kv.match(/(['"])(.*?)\1\s*=>/)?.[2];
            if (key)
                usedAttrs.add(key);
        }
    }
    for (const key of usedAttrs) {
        if (props.fillable.length > 0 && !props.fillable.includes(key)) {
            diags.push(makeDiag(doc, 0, 1, `Attribute '${key}' is used in mass-assignment but not present in $fillable.`, vscode.DiagnosticSeverity.Warning));
        }
    }
    return diags;
}
function makeDiag(doc, line, col, msg, sev) {
    return new vscode.Diagnostic(new vscode.Range(new vscode.Position(line, col), new vscode.Position(line, col + 1)), msg, sev);
}
//# sourceMappingURL=diagnostics.js.map