import * as vscode from 'vscode';

export function isModelPhp(doc: vscode.TextDocument): boolean {
  const text = doc.getText();
  return /class\s+\w+\s+extends\s+Model\b/.test(text) || /use\s+Illuminate\\Database\\Eloquent\\Model;/.test(text);
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function phpArrayParse(raw: string): string[] {
  // quick & dirty: ['a','b'] or [\"a\", \"b\"] → [\"a\",\"b\"]
  const inside = raw.replace(/^\s*\[\s*|\s*\]\s*$/g, '');
  const matches = inside.match(/(['"])(.*?)\1/g) || [];
  return matches.map(m => m.slice(1, -1));
}

export function phpAssocArrayParse(raw: string): Record<string, string> {
  // parses ['foo'=>'int','bar' => 'datetime']
  const obj: Record<string, string> = {};
  const inside = raw.replace(/^\s*\[\s*|\s*\]\s*$/g, '');
  const pairs = inside.split(/,(?![^\[]*\])/).map(s => s.trim()).filter(Boolean);
  for (const p of pairs) {
    const m = p.match(/(['"])(.*?)\1\s*=>\s*(['"])(.*?)\3/);
    if (m) obj[m[2]] = m[4];
  }
  return obj;
}
