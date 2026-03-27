import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

import { config } from '../config.js';

const { fetch } = config;

export async function downloadURLToPath(url: string, filePath: string) {
  const res = await fetch(url);

  if (!res.body) {
    throw new Error('Unexpected response, no response body');
  }

  const fileStream = createWriteStream(filePath, { flags: 'w' });
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}
