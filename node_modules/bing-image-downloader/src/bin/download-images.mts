#!/usr/bin/env node

import { resolve } from 'path';
import { downloadImages, setCookie, setLogLevel } from '../index.js';
import { exists } from '../utils/fs.js';
import { log } from '../log.js';

const cookie = process.env.npm_config_cookie || process.env.BING_COOKIE;
const logLevel = Number(process.env.npm_config_log_level) || 2;
const instructions = `Usage: npx exec download-images "Your Image Prompt" "/path/to/save/images/to"

If no directory is provided, the current directory is used

Flags:
--cookie=<Bing Session Cookie>
--logLevel=<Log Level> [set to 4 to disable messages]

The session cookie can also be provided via the BING_COOKIE env var`;

let [, , prompt, directory] = process.argv;

if (!directory) {
  directory = '.';
}

if (!cookie || !prompt) {
  throwMsg(instructions);
}
const resolvedDirectory = resolve(directory);

if (!(await exists(resolvedDirectory))) {
  throwMsg(`${directory} does not exist`);
}

setLogLevel(logLevel);
setCookie(cookie);
const imagePaths = await downloadImages(prompt, resolvedDirectory);

log(`downloaded ${imagePaths.length} to the following files: \n${imagePaths.join('\n')}`, 2);

function throwMsg(msg: string): never {
  console.error(msg);
  return process.exit();
}
