"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModel = parseModel;
const utils_1 = require("./utils");
const rePropArray = (name) => new RegExp(`\\$${name}\\s*=\\s*\\[(.|\\s)*?\\];`, 'm');
const rePropAssoc = (name) => new RegExp(`\\$${name}\\s*=\\s*\\[(.|\\s)*?\\];`, 'm');
function parseModel(doc) {
    const text = doc.getText();
    const classMatch = text.match(/class\s+(\w+)\s+extends\s+Model\b/);
    if (!classMatch)
        return null;
    const grab = (name) => {
        const m = text.match(rePropArray(name));
        return m ? (0, utils_1.phpArrayParse)(m[0].split('=')[1]) : [];
    };
    const grabAssoc = (name) => {
        const m = text.match(rePropAssoc(name));
        return m ? (0, utils_1.phpAssocArrayParse)(m[0].split('=')[1]) : {};
    };
    const fillable = grab('fillable');
    const guardedRaw = text.match(rePropArray('guarded'));
    const guarded = guardedRaw ? (0, utils_1.phpArrayParse)(guardedRaw[0].split('=')[1]) : null;
    const casts = grabAssoc('casts');
    const hidden = grab('hidden');
    const appends = grab('appends');
    // heuristic relations: function foo() { return $this->hasOne(...); }
    const relations = {};
    const relRE = /function\s+(\w+)\s*\(\s*\)\s*\{[^}]*?\$this->(hasOne|hasMany|belongsTo|belongsToMany|morphOne|morphMany|morphTo|morphToMany)\b/gs;
    let m;
    while ((m = relRE.exec(text))) {
        relations[m[1]] = m[2];
    }
    return {
        file: doc.uri.fsPath,
        className: classMatch[1],
        fillable, guarded, casts, hidden, appends, relations
    };
}
//# sourceMappingURL=modelParser.js.map