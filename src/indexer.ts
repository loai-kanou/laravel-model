import * as vscode from 'vscode';
import { ModelProps } from './types';
import { isModelPhp } from './utils';
import { parseModel } from './modelParser';

export class ModelIndex {
  private models = new Map<string, ModelProps>(); // key: fsPath

  async indexWorkspace() {
    this.models.clear();
    const files = await vscode.workspace.findFiles('**/*.php', '**/vendor/**');
    for (const uri of files) {
      const doc = await vscode.workspace.openTextDocument(uri);
      if (!isModelPhp(doc)) continue;
      const parsed = parseModel(doc);
      if (parsed) this.models.set(uri.fsPath, parsed);
    }
  }

  getModel(fsPath: string): ModelProps | undefined {
    return this.models.get(fsPath);
  }

  getAll(): ModelProps[] {
    return Array.from(this.models.values());
  }
}
