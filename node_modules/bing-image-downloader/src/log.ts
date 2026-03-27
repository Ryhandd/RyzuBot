import { writeFileSync } from 'fs';

import { config } from './config.js';

export function log(msg: string, logLevel: number, filePath?: string) {
  if (logLevel < config.logLevel) return;
  if (filePath) {
    // this is sync because if the script throws it won't write otherwise
    writeFileSync(filePath, msg);
  } else {
    console.log(msg);
  }
}
