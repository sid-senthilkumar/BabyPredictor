import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SETTINGS_FILE = join(__dirname, '../.settings.json');

const defaults = {
    claudeApiKey: process.env.CLAUDE_API_KEY || '',
    togetherApiKey: process.env.TOGETHER_API_KEY || ''
};

export async function getSettings() {
    try {
        const data = await readFile(SETTINGS_FILE, 'utf-8');
        return { ...defaults, ...JSON.parse(data) };
    } catch {
        return { ...defaults };
    }
}

export async function saveSettings(incoming) {
    const current = await getSettings();
    const updated = { ...current, ...incoming };
    await writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2));
    return updated;
}
