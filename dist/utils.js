"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isModelPhp = isModelPhp;
exports.unique = unique;
exports.phpArrayParse = phpArrayParse;
exports.phpAssocArrayParse = phpAssocArrayParse;
function isModelPhp(doc) {
    const text = doc.getText();
    return /class\s+\w+\s+extends\s+Model\b/.test(text) || /use\s+Illuminate\\Database\\Eloquent\\Model;/.test(text);
}
function unique(arr) {
    return Array.from(new Set(arr));
}
function phpArrayParse(raw) {
    // quick & dirty: ['a','b'] or [\"a\", \"b\"] → [\"a\",\"b\"]
    const inside = raw.replace(/^\s*\[\s*|\s*\]\s*$/g, '');
    const matches = inside.match(/(['"])(.*?)\1/g) || [];
    return matches.map(m => m.slice(1, -1));
}
function phpAssocArrayParse(raw) {
    // parses ['foo'=>'int','bar' => 'datetime']
    const obj = {};
    const inside = raw.replace(/^\s*\[\s*|\s*\]\s*$/g, '');
    const pairs = inside.split(/,(?![^\[]*\])/).map(s => s.trim()).filter(Boolean);
    for (const p of pairs) {
        const m = p.match(/(['"])(.*?)\1\s*=>\s*(['"])(.*?)\3/);
        if (m)
            obj[m[2]] = m[4];
    }
    return obj;
}
//# sourceMappingURL=utils.js.map