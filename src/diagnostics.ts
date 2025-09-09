import * as vscode from 'vscode';
import { ModelProps } from './types';

export function computeDiagnostics(doc: vscode.TextDocument, props: ModelProps | null): vscode.Diagnostic[] {
  const diags: vscode.Diagnostic[] = [];
  if (!props) return diags;

  const full = doc.getText();

  // No fillable nor guarded
  if ((props.fillable.length === 0) && (props.guarded === null)) {
    diags.push(makeDiag(
      doc, 0, 1,
      "Model has neither $fillable nor $guarded. Mass-assignment behavior is ambiguous. Consider defining $fillable explicitly.",
      vscode.DiagnosticSeverity.Warning
    ));
  }

  // guarded = ['*']
  if (props.guarded && props.guarded.length === 1 && props.guarded[0] === '*') {
    diags.push(makeDiag(
      doc, 0, 1,
      "Model uses $guarded = ['*'] (locks all). Prefer explicit $fillable for clarity.",
      vscode.DiagnosticSeverity.Information
    ));
  }

  // Simple usage check: detect ->create([... 'foo' => ...]) attributes not in $fillable
  const usedAttrs = new Set<string>();
  const createRE = /(create|update|fill)\s*\(\s*\[(.*?)\]\s*\)/gs;
  let m: RegExpExecArray | null;
  while ((m = createRE.exec(full))) {
    const body = m[2];
    for (const kv of body.split(',')) {
      const key = kv.match(/(['"])(.*?)\1\s*=>/)?.[2];
      if (key) usedAttrs.add(key);
    }
  }
  for (const key of usedAttrs) {
    if (props.fillable.length > 0 && !props.fillable.includes(key)) {
      diags.push(makeDiag(
        doc, 0, 1,
        `Attribute '${key}' is used in mass-assignment but not present in $fillable.`,
        vscode.DiagnosticSeverity.Warning
      ));
    }
  }

  return diags;
}

function makeDiag(doc: vscode.TextDocument, line: number, col: number, msg: string, sev: vscode.DiagnosticSeverity) {
  return new vscode.Diagnostic(
    new vscode.Range(new vscode.Position(line, col), new vscode.Position(line, col + 1)),
    msg, sev
  );
}
