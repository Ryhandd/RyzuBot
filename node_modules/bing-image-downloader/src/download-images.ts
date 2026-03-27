import { randomUUID } from 'crypto';

import { fetchImageURLs } from './fetch-image-urls.js';
import path from 'path';
import { downloadURLToPath } from './utils/download-file.js';

/** Fetches all images from bing for a given prompt.  Returns an array of filenames */
export async function downloadImages(prompt: string, targetDirectory: string): Promise<string[]> {
  const imageURLs = await fetchImageURLs(prompt);
  const filePaths = await Promise.all(imageURLs.map((img) => downloadImage(img, targetDirectory)));

  return filePaths;
}

async function downloadImage(url: string, targetDirectory: string): Promise<string> {
  const filePath = path.join(targetDirectory, `${randomUUID()}.jpg`);

  await downloadURLToPath(url, filePath);

  return filePath;
}
