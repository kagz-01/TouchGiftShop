import fs from 'fs';
const transcriptPath = '/home/kagz03/.gemini/antigravity-ide/brain/bc8ac1e5-c54d-4a9a-8348-5f1c556300c3/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let extracted = [];
for (const line of lines) {
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
            for (const call of obj.tool_calls) {
                if ((call.name === 'replace_file_content' || call.name === 'multi_replace_file_content') && call.args && call.args.TargetFile && call.args.TargetFile.includes('generate-catalog.mjs')) {
                    
                    if (call.name === 'replace_file_content') {
                        extracted.push(call.args.ReplacementContent);
                    } else if (call.name === 'multi_replace_file_content') {
                        const chunks = typeof call.args.ReplacementChunks === 'string' ? JSON.parse(call.args.ReplacementChunks) : call.args.ReplacementChunks;
                        for (const chunk of chunks) {
                            extracted.push(chunk.ReplacementContent);
                        }
                    }
                }
            }
        }
    } catch(e) {}
}

fs.writeFileSync('scripts/recovered_chunks.txt', extracted.join('\n\n---\n\n'));
console.log('Done recovering');
