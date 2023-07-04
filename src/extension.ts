// Moved AsyncZettelViewTreeItem and ZettelViewTreeDataProvider to separate modules

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MyLogger } from './utils/MyLogger';  
import { idregex } from './utils/utils'; // Add the import statement for replaceIncomingLinks
import { replaceIncomingLinks } from './utils/replaceIncomingLinks'; // Add the import statement for replaceIncomingLinks
import { AsyncZettelViewTreeItem } from './AsyncZettelViewTreeItem';
import { ZettelViewTreeDataProvider } from './ZettelViewTreeDataProvider';
import { IncomingLinksMap } from './utils/IncomingLinksMap';
import { IncomingLinksViewTreeDataProvider } from './IncomingLinksViewTreeDataProvider';


const incomingLinksMap = new IncomingLinksMap();

export function activate(context: vscode.ExtensionContext): void {
    const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
    ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    
    if (workspaceRoot) {
        const provider = new ZettelViewTreeDataProvider(workspaceRoot, incomingLinksMap);
        vscode.window.registerTreeDataProvider('zettelView', provider);
        
        vscode.commands.registerCommand('zettelView.refreshEntry', () => provider.refresh());
        registerRenameCommand(provider, workspaceRoot, incomingLinksMap); // Pass the workspaceRoot and incomingLinksMap to the function

        const incomingZettelViewProvider = new IncomingLinksViewTreeDataProvider(workspaceRoot, incomingLinksMap);
        vscode.window.registerTreeDataProvider('incomingZettelView', incomingZettelViewProvider);

        vscode.commands.registerCommand('incomingZettelView.refreshEntry', () => incomingZettelViewProvider.refresh());
    }
}

function registerRenameCommand(provider: ZettelViewTreeDataProvider, workspaceRoot: string, incomingLinksMap: IncomingLinksMap) {
    vscode.commands.registerCommand('zettelView.renameEntry', async (node) => {
        // Prompt the user for the new name
        const newID = await vscode.window.showInputBox({ prompt: 'Enter the new ID' });
        if (newID && node) {
            // Validate the new ID against the regex
            MyLogger.logMsg(`New name: ${newID}`);
            if (!idregex.idRegExp.test(newID)) {
                vscode.window.showErrorMessage(`The new ID ${newID} does not match ${idregex.idRegExpStr}. Please try again.`);
                return;
            }
    
            // Assume node.fsPath is the file path of the file to be renamed
            const oldPath = node.fsPath;
            //concatenate the new ID with the extension ".md"
            const newName = `${newID}.md`;
            const newPath = path.join(path.dirname(oldPath), newName);

            try {
                // Rename the file
                await fs.promises.rename(oldPath, newPath);
            } catch (error) {
                MyLogger.logMsg(`Failed to rename file: ${error}`);
            }

            // Now find and replace all the links in the workspace
            const oldID = path.basename(oldPath, '.md'); // Extract old ID from oldPath without '.md'

            // Call replaceIncomingLinks function
            await replaceIncomingLinks(oldID, newID, workspaceRoot, incomingLinksMap);

            // Refresh the tree view
            provider.refresh();
        }   
    });
}
