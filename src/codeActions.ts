import * as vscode from 'vscode';
import { ModelProps } from './types';

export class ModelCodeActions implements vscode.CodeActionProvider {
  static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Refactor];

  constructor(private getProps: (doc: vscode.TextDocument) => ModelProps | null) {}

  provideCodeActions(doc: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
    const props = this.getProps(doc);
    if (!props) return;
    const actions: vscode.CodeAction[] = [];

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

  private replaceArrayAction(doc: vscode.TextDocument, varName: string, key: string, title: string) {
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
    } else {
      // create new property
      action.edit.insert(doc.uri, new vscode.Position(1, 0), `\nprotected $${varName} = ['${key}'];\n`);
    }
    return action;
  }
}
