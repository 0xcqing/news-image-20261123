import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/**
 * Main entry point for the make.fun news-image entry.
 * Safely copies entry.png to the output directory and verifies integrity.
 */
async function main() {
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const sourcePath = join(__dirname, 'entry.png');
        
        // Ensure we handle the output directory correctly based on environment
        const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
        const outputPath = join(outputDir, 'entry.png');

        console.log(`Starting process... Source: ${sourcePath}, Target: ${outputPath}`);

        // Read and calculate hash for source
        const sourceData = await readFile(sourcePath);
        const sourceStats = await stat(sourcePath);
        
        if (sourceStats.size === 0) {
            throw new Error("Integrity check failed: Source file is empty.");
        }
        
        const sourceHash = createHash('sha256').update(sourceData).digest('hex');

        // Prepare output
        await mkdir(outputDir, { recursive: true });
        await writeFile(outputPath, sourceData);

        // Verification
        const outputData = await readFile(outputPath);
        const outputHash = createHash('sha256').update(outputData).digest('hex');

        if (sourceStats.size !== outputData.length) {
            throw new Error(`Integrity check failed: Size mismatch. Source: ${sourceStats.size}, Output: ${outputData.length}`);
        }
        if (sourceHash !== outputHash) {
            throw new Error(`Integrity check failed: Hash mismatch. Expected: ${sourceHash}, Got: ${outputHash}`);
        }

        console.log(`Successfully verified and copied entry.png:`);
        console.log(`Size: ${sourceStats.size} bytes`);
        console.log(`Path: ${outputPath}`);
        console.log(`Digest: ${sourceHash}`);
    } catch (e) {
        console.error('Fatal error during entry copy process:', e.message);
        process.exit(1);
    }
}

// Execute the main process
main();
