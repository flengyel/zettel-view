// Moved AsyncZettelViewTreeItem and ZettelViewTreeDataProvider to separate modules

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { logger, idregex } from './utils/utils';
import { AsyncZettelViewTreeItem } from './AsyncZettelViewTreeItem';
import { ZettelViewTreeDataProvider } from './ZettelViewTreeDataProvider';
import { IncomingLinksMap } from './utils/IncomingLinksMap';

const incomingLinksMap = new IncomingLinksMap();

export function activate(context: vscode.ExtensionContext): void {
    const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
    ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    
    if (workspaceRoot) {
        const provider = new ZettelViewTreeDataProvider(workspaceRoot, incomingLinksMap);
        vscode.window.registerTreeDataProvider('zettelView', provider);
        
        vscode.commands.registerCommand('zettelView.refreshEntry', () => provider.refresh());
        registerRenameCommand(provider); // moved rename command registration to a separate function
    }
}

function registerRenameCommand(provider: ZettelViewTreeDataProvider) {
    vscode.commands.registerCommand('zettelView.renameEntry', async (node) => {
        // Prompt the user for the new name
        const newID = await vscode.window.showInputBox({ prompt: 'Enter the new ID' });
        if (newID && node) {
            // Validate the new ID against the regex
            logger(`New name: ${newID}`);
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
                logger(`Failed to rename file: ${error}`);
            }
            // Now find and replace all the links in the workspace
            
            const oldID = path.basename(oldPath);
        
            //await replaceLinks(oldPath, newPath, workspaceRoot);
           // await replaceLinks(node, oldID, newID, workspaceRoot);

            // Refresh the tree view
            provider.refresh();
        }   
    });
}
