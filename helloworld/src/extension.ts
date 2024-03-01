

import * as vscode from 'vscode';

let hover: vscode.Disposable | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(handleSelectionChange)
    );
	vscode.commands.registerCommand("nihao2", ()=>{
		vscode.window.showInformationMessage("我是菜单2");
	});
}

async function handleSelectionChange(event: vscode.TextEditorSelectionChangeEvent) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.selections.length === 0) {
        return;
    }

    const selection = event.selections[0];
    const selectedText = editor.document.getText(selection);

    if (selectedText) {
        const hoverText = new vscode.MarkdownString('[click me]');
        hover = vscode.languages.registerHoverProvider({ scheme: 'file' }, {
            provideHover: () => {
                return new vscode.Hover(hoverText);
            }
        });
    } else {
        if (hover) {
            hover.dispose();
            hover = undefined;
        }
    }
}

export function deactivate() {
    if (hover) {
        hover.dispose();
    }
}