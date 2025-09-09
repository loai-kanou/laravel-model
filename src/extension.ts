import * as vscode from 'vscode';
import { ModelIndex } from './indexer';
import { parseModel } from './modelParser';
import { computeDiagnostics } from './diagnostics';
import { ModelCodeActions } from './codeActions';
import { ModelLensProvider } from './codeLens';
import { syncDocblocks } from './docblocks';

const collection = vscode.languages.createDiagnosticCollection('laravel-models');
const index = new ModelIndex();
const lenses = new ModelLensProvider();

export async function activate(context: vscode.ExtensionContext) {
  await index.indexWorkspace();

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(onDocChanged),
    vscode.workspace.onDidOpenTextDocument(onDocChanged),
    vscode.workspace.onDidChangeTextDocument(e => onDocChanged(e.document)),
    vscode.languages.registerCodeActionsProvider('php', new ModelCodeActions(doc => parseModelSafe(doc)), {
      providedCodeActionKinds: ModelCodeActions.providedCodeActionKinds
    }),
    vscode.languages.registerCodeLensProvider({ language: 'php' }, lenses),
    vscode.commands.registerCommand('laravelModels.scanWorkspace', async () => {
      await index.indexWorkspace();
      refreshVisible();
      vscode.window.showInformationMessage('Laravel Models re-indexed.');
    }),
    vscode.commands.registerCommand('laravelModels.generateFillable', async () => {
      const doc = vscode.window.activeTextEditor?.document;
      if (!doc) return;
      const props = parseModelSafe(doc);
      if (!props) return;
      if (props.fillable.length > 0) {
        vscode.window.showInformationMessage('Model already has $fillable. Edit manually or use Quick Fixes.');
        return;
      }
      const used = extractUsedAttrs(doc);
      if (used.size === 0) {
        vscode.window.showWarningMessage('No mass-assignment usage detected. Add manually or enable DB-aware mode.');
        return;
      }
      const edit = new vscode.WorkspaceEdit();
      edit.insert(doc.uri, new vscode.Position(1, 0),
        `\nprotected $fillable = [${Array.from(used).map(a => `'${a}'`).join(', ')}];\n`);
      await vscode.workspace.applyEdit(edit);
    }),
    vscode.commands.registerCommand('laravelModels.syncDocblocks', async () => {
      const doc = vscode.window.activeTextEditor?.document;
      if (!doc) return;
      const props = parseModelSafe(doc);
      if (!props) return;
      await syncDocblocks(doc, props);
      vscode.window.showInformationMessage('DocBlocks synced.');
    })
  );

  refreshVisible();
}

function parseModelSafe(doc: vscode.TextDocument) {
  try { return parseModel(doc) } catch { return null; }
}

function extractUsedAttrs(doc: vscode.TextDocument): Set<string> {
  const text = doc.getText();
  const set = new Set<string>();
  const re = /(create|update|fill)\s*\(\s*\[(.*?)\]\s*\)/gs;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    for (const kv of m[2].split(',')) {
      const key = kv.match(/(['"])(.*?)\1\s*=>/)?.[2];
      if (key) set.add(key);
    }
  }
  return set;
}

async function onDocChanged(doc: vscode.TextDocument) {
  if (doc.languageId !== 'php') return;
  const props = parseModelSafe(doc);
  if (!props) {
    collection.delete(doc.uri);
    return;
  }
  const diags = computeDiagnostics(doc, props);
  collection.set(doc.uri, diags);
  lenses.setModel(doc.uri.fsPath, props);
}

function refreshVisible() {
  const ed = vscode.window.activeTextEditor?.document;
  if (ed) onDocChanged(ed);
}

export function deactivate() {
  collection.clear();
}
