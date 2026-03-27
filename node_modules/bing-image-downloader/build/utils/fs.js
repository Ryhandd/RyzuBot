import { lstat } from 'fs/promises';
export function exists(filePath) {
    return new Promise(async (resolve) => {
        await lstat(filePath)
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
}
