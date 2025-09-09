import * as vscode from 'vscode';
import { ModelProps } from './types';

export class ModelLensProvider implements vscode.CodeLensProvider {
  private onDidChangeEmitter = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses: vscode.Event<void> = this.onDidChangeEmitter.event;
  private cache = new Map<string, ModelProps>();

  setModel(fsPath: string, props: ModelProps | null) {
    if (!props) return;
    this.cache.set(fsPath, props);
    this.onDidChangeEmitter.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const props = this.cache.get(document.uri.fsPath);
    if (!props) return [];
    const header = `fillable:${props.fillable.length} guarded:${props.guarded ? props.guarded.length : 0} casts:${Object.keys(props.casts).length} hidden:${props.hidden.length} appends:${props.appends.length} rel:${Object.keys(props.relations).length}`;
    const range = new vscode.Range(0, 0, 0, 1);
    return [
      new vscode.CodeLens(range, { title: header, command: '' }),
      new vscode.CodeLens(range, { title: "Generate $fillable", command: "laravelModels.generateFillable" }),
      new vscode.CodeLens(range, { title: "Sync DocBlocks", command: "laravelModels.syncDocblocks" })
    ];
  }
}
