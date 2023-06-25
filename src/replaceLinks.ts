import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

export async function replaceLinks(oldPath: string, newPath: string): Promise<void> {
    const oldID = path.basename(oldPath, '.md');
    const newID = path.basename(newPath, '.md');
    const dirPath = path.dirname(oldPath);

    // Get all markdown files in the root directory
    const files = await readdir(dirPath);

    const mdFiles = files.filter((file) => path.extname(file) === '.md');

    // For each markdown file
    for (const file of mdFiles) {
        const filePath = path.join(dirPath, file);

        // Read the content of the file
        const content = await readFile(filePath, 'utf-8');

        // Create a regex to match the old filename
        const regex = new RegExp(`\\[\\[${oldID}\\]\\]`, 'g');

        // Replace the old ID with the new ID
        const newContent = content.replace(regex, `[[${newID}]]`);

        // Write the new content back to the file
        await writeFile(filePath, newContent, 'utf-8');
    }
}
