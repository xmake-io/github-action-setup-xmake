import * as fs from 'fs';

export function isFile(filepath: string): boolean {
    try {
        fs.accessSync(filepath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export function isDir(filepath: string): boolean {
    try {
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
