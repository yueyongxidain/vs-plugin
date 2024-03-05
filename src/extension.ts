import * as vscode from "vscode";
import marked from 'marked'
import path from 'path'

let hover: vscode.Disposable | undefined = undefined;
let selectedText=""
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(handleSelectionChange)
  );
  vscode.commands.registerCommand("nihao2", () => {
    vscode.window.showInformationMessage("我是菜单2");
  });

  let disposable = vscode.commands.registerCommand("hello.newPage",async  () => {
    // 获取当前活动的编辑器
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const panel = vscode.window.createWebviewPanel(
        "newPage", // 唯一标识符
        "New Page", // 标题
        vscode.ViewColumn.Beside, // 显示在活动标签页中
        {
          enableScripts: true // 启用 JavaScript 脚本执行
      }
      );
      let markdownContent = [] 
      markdownContent.push("```typescript\n")
      markdownContent.push(selectedText)
      markdownContent.push("\n```")
      const extensionPath = context.extensionPath;
      const stylePath = vscode.Uri.file(path.join(extensionPath, 'lib/editor/css', 'editormd.css'));
      const jsPath = vscode.Uri.file(path.join(extensionPath, 'lib/editor', 'editormd.min.js'));
      const libPath = vscode.Uri.file(path.join(extensionPath, 'lib/editor/lib'));
      const zeptoJsPath = vscode.Uri.file(path.join(extensionPath, 'lib/zepto', 'zepto.js'));
      const styleUri = panel.webview.asWebviewUri(stylePath);
      const jsUri = panel.webview.asWebviewUri(jsPath);
      const libUri = panel.webview.asWebviewUri(libPath);
      const  zeptoJsUri = panel.webview.asWebviewUri(zeptoJsPath);

      // 更新 Webview 中的内容
      updateWebviewContent(panel.webview, markdownContent,jsUri, styleUri, libUri, zeptoJsUri);

      // 加载 HTML 内容到 Webview
      // panel.webview.html = getWebviewContent();
      const changeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === editor.document) {
          let markdownContent = [] 
          markdownContent.push("```typescript")
          markdownContent.push(selectedText)
          markdownContent.push("```")
            updateWebviewContent(panel.webview, markdownContent,jsUri, styleUri, libUri, zeptoJsUri);
        }
    });

    // 当 Webview 面板被关闭时，注销事件监听器
    panel.onDidDispose(() => {
        changeDisposable.dispose();
    });

    }
  });

  context.subscriptions.push(disposable);
}

async function handleSelectionChange(
  event: vscode.TextEditorSelectionChangeEvent
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || event.selections.length === 0) {
    return;
  }

  const selection = event.selections[0];
  selectedText = editor.document.getText(selection);

  if (selectedText) {
    await vscode.commands.executeCommand(
      "setContext",
      "editorHasSelection",
      selectedText.length > 0
    );
    const hoverText = new vscode.MarkdownString("[click me]");
    hover = vscode.languages.registerHoverProvider(
      { scheme: "file" },
      {
        provideHover: () => {
          return new vscode.Hover(hoverText);
        },
      }
    );
  } else {
    if (hover) {
      hover.dispose();
      hover = undefined;
    }
  }
}
function updateWebviewContent(webview: vscode.Webview, markdownContent: string[], jsUri: vscode.Uri,styleUri: vscode.Uri, libUri: vscode.Uri, zeptoJsUri: vscode.Uri) {

  webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Markdown Preview</title>
          <style>
              body { font-family: 'Arial', sans-serif; }
              /* 添加其他样式，例如 Markdown 渲染样式 */
          </style>
          <link rel="stylesheet" href="${styleUri}">
          <script type="text/javascript" src="${zeptoJsUri}"></script>
          <script type="text/javascript" src="${jsUri}"></script>
      </head>
      <body>
        <div id="test-editormd">
          <textarea style="display:none;">${markdownContent.join('')}</textarea>
         </div>
      </body>
      <script>
      testEditor = editormd("test-editormd", {
        width   : "90%",
        height  : 640,
        syncScrolling : "single",
        path    : "${libUri}"
    });
  </script>
      </html>
  `;
}
export function deactivate() {
  if (hover) {
    hover.dispose();
  }
}
