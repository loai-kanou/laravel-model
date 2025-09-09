import * as vscode from 'vscode';
import { ModelProps } from './types';

export async function syncDocblocks(doc: vscode.TextDocument, props: ModelProps) {
  const edit = new vscode.WorkspaceEdit();
  const headerPos = new vscode.Position(0, 0);
  const block = buildDocblock(props);
  edit.insert(doc.uri, headerPos, block);
  await vscode.workspace.applyEdit(edit);
}

function buildDocblock(props: ModelProps): string {
  const attrs = new Set<string>([
    ...props.fillable,
    ...Object.keys(props.casts),
    ...props.hidden,
    ...props.appends
  ]);
  const lines: string[] = ["/**"];
  for (const a of Array.from(attrs).sort()) {
    lines.push(` * @property mixed $${a}`);
  }
  for (const [name, kind] of Object.entries(props.relations)) {
    lines.push(` * @method static \\Illuminate\\Database\\Eloquent\\Relations\\${mapRel(kind)} ${name}()`);
  }
  lines.push(" */\n");
  return lines.join("\n");
}

function mapRel(k: string): string {
  const map: Record<string, string> = {
    hasOne: 'HasOne', hasMany: 'HasMany', belongsTo: 'BelongsTo', belongsToMany: 'BelongsToMany',
    morphOne: 'MorphOne', morphMany: 'MorphMany', morphTo: 'MorphTo', morphToMany: 'MorphToMany'
  };
  return map[k] ?? 'Relation';
}
