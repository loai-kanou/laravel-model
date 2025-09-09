import * as vscode from 'vscode';
import { ModelProps } from './types';
import { phpArrayParse, phpAssocArrayParse } from './utils';

const rePropArray = (name: string) => new RegExp(`\\$${name}\\s*=\\s*\\[(.|\\s)*?\\];`, 'm');
const rePropAssoc = (name: string) => new RegExp(`\\$${name}\\s*=\\s*\\[(.|\\s)*?\\];`, 'm');

export function parseModel(doc: vscode.TextDocument): ModelProps | null {
  const text = doc.getText();
  const classMatch = text.match(/class\s+(\w+)\s+extends\s+Model\b/);
  if (!classMatch) return null;

  const grab = (name: string): string[] => {
    const m = text.match(rePropArray(name));
    return m ? phpArrayParse(m[0].split('=')[1]) : [];
  };

  const grabAssoc = (name: string): Record<string, string> => {
    const m = text.match(rePropAssoc(name));
    return m ? phpAssocArrayParse(m[0].split('=')[1]) : {};
  };

  const fillable = grab('fillable');
  const guardedRaw = text.match(rePropArray('guarded'));
  const guarded = guardedRaw ? phpArrayParse(guardedRaw[0].split('=')[1]) : null;
  const casts = grabAssoc('casts');
  const hidden = grab('hidden');
  const appends = grab('appends');

  // heuristic relations: function foo() { return $this->hasOne(...); }
  const relations: Record<string, string> = {};
  const relRE = /function\s+(\w+)\s*\(\s*\)\s*\{[^}]*?\$this->(hasOne|hasMany|belongsTo|belongsToMany|morphOne|morphMany|morphTo|morphToMany)\b/gs;
  let m: RegExpExecArray | null;
  while ((m = relRE.exec(text))) {
    relations[m[1]] = m[2];
  }

  return {
    file: doc.uri.fsPath,
    className: classMatch[1],
    fillable, guarded, casts, hidden, appends, relations
  };
}
