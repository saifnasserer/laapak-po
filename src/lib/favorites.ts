import fs from 'fs';
import path from 'path';

const FAVORITES_FILE = path.join(process.cwd(), 'src/data/favorites.json');

// Ensure the directory exists
function ensureDirectory() {
    const dir = path.dirname(FAVORITES_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(FAVORITES_FILE)) {
        fs.writeFileSync(FAVORITES_FILE, JSON.stringify([]));
    }
}

export async function getFavorites(): Promise<string[]> {
    ensureDirectory();
    try {
        const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading favorites:', error);
        return [];
    }
}

export async function toggleFavorite(clientId: string): Promise<boolean> {
    ensureDirectory();
    try {
        const favorites = await getFavorites();
        const index = favorites.indexOf(clientId);
        let newFavorites: string[];

        if (index === -1) {
            newFavorites = [...favorites, clientId];
        } else {
            newFavorites = favorites.filter(id => id !== clientId);
        }

        fs.writeFileSync(FAVORITES_FILE, JSON.stringify(newFavorites));
        return index === -1; // returns true if added, false if removed
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
}

export async function isClientFavorite(clientId: string): Promise<boolean> {
    const favorites = await getFavorites();
    return favorites.includes(clientId);
}
