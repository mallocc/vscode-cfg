"use strict";
import * as vscode from "vscode";
import * as dochelp from "./documentHelpers";
import * as format from "./formatProvider";

export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerDocumentFormattingEditProvider("cfg", {
        provideDocumentFormattingEdits(
            document: vscode.TextDocument,
            options: vscode.FormattingOptions
        ): vscode.TextEdit[] {
            const {
                tc,
                td,
                ts
            }: {
                tc: string;
                td: number;
                ts: number;
            } = dochelp.getIndentationStyle(options);

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return []; // No open text editor
            }
            return [
                vscode.TextEdit.replace(
                    dochelp.fullDocumentRange(document),
                    format.formatcfg(document.getText(), "", tc, td)
                )
            ];
        }
    });

    vscode.languages.registerDocumentRangeFormattingEditProvider("cfg", {
        provideDocumentRangeFormattingEdits(
            document: vscode.TextDocument,
            range: vscode.Range,
            options: vscode.FormattingOptions
        ): vscode.TextEdit[] {
            const {
                tc,
                td,
                ts
            }: {
                tc: string;
                td: number;
                ts: number;
            } = dochelp.getIndentationStyle(options);

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return []; // No open text editor
            }

            let preIndent = "";
            let priorLine = dochelp.getPreviousLineContaintingText(
                document,
                range
            );
            if (priorLine !== undefined) {
                preIndent = format.guessPreIndentation(priorLine, tc, td, ts);
            }
            let selectedLines = dochelp.getSelectedLines(document, range);
            return [
                vscode.TextEdit.replace(
                    selectedLines,
                    format.formatcfg(
                        document.getText(selectedLines),
                        preIndent,
                        tc,
                        td
                    )
                )
            ];
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand("cfg.escapeToQuotedcfg", _ => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        const selections: vscode.Selection[] = editor.selections;

        editor.edit(builder => {
            for (const selection of selections) {
                builder.replace(selection, format.escapeToQuotedcfg(editor.document.getText(selection)));
            }
        });
    }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
