import vscode from 'vscode'
vscode.Selection
export class CustomCodeLensProvider implements vscode.CodeLensProvider {
	public provideCodeLenses(
		document: vscode.TextDocument
	): vscode.ProviderResult<vscode.CodeLens[]> {
		let codeLensLine: number = document.lineCount - 1;

		const range: vscode.Range = new vscode.Range(
			codeLensLine,
			0,
			codeLensLine,
			0
		);
		const codeLens: vscode.CodeLens[] = [];

		codeLens.push(
			new vscode.CodeLens(range, {
				title: "hello1",
				command: "showmessage",
				arguments: [document],
			})
		);

		codeLens.push(
			new vscode.CodeLens(range, {
				title: "hello2",
				command: "showmessage",
				arguments: [document],
			})
		);
		return codeLens;
	}
}
