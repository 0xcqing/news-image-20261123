import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function copyEntry() {
    try {
        const entryPath = join(__dirname, 'entry.png');
        const outputDir = process.env.MAKEFUN_OUTPUT_DIR || join(__dirname, 'output');
        
        await mkdir(outputDir, { recursive: true });
        
        const stats = await stat(entryPath);
        if (stats.size > 1048576) {
            throw new Error(`File too large: ${stats.size} bytes`);
        }
        
        const data = await readFile(entryPath);
        const outputPath = join(outputDir, 'entry.png');
        
        await writeFile(outputPath, data);
        
        const outputStats = await stat(outputPath);
        console.log(`Successfully copied ${outputStats.size} bytes to ${outputPath}`);
    } catch (err) {
        console.error('CRITICAL ERROR: Failed to copy entry file:', err.message);
        process.exit(1);
    }
}

copyEntry();
