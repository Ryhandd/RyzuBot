A web scraper for Bing's Image Creator.

#### Console API

```sh
npx exec download-images "Your Image Prompt" "/path/to/save/images/to"

If no directory is provided, the current directory is used

Flags:
--cookie=<Bing Session Cookie>
--logLevel=<Log Level> [set to 4 to disable messages]

The session cookie can also be provided via the BING_COOKIE env var:

export BING_COOKIE="cookie goes here"
```

If no path is provided, it saves images to the current directory

#### JS API

```ts
import { downloadImages, fetchImageURLs, setCookie } from 'bing-image-downloader';

setCookie('Bing session cookie');

const imageURLs = await fetchImageURLs('A Penguin');
const fileNames = await downloadImages('A Penguin', '/path/to/directory');
```

#### Cookie

You need to provide the `_U` cookie from bing to this script. The simplest way to get it is to paste this into your console in a logged in browser:

```js
document.cookie.match('(^|; )_U=([^;]*)')[2];
```

#### Logging

If you want to see log messages ("Downloading image ...", etc), set the log level to 2:

```ts
import { setLogLevel } from 'bing-image-downloader';
setLogLevel(2);
```

#### Requirements

For node.js >= 21, there are no requirements.

For node <21, you need to provide a fetch API, e.g. [node-fetch](https://www.npmjs.com/package/node-fetch):

You can either globally polyfill it in your project, e.g.:

```ts
import fetch from 'node-fetch';
if (!globalThis.fetch) {
  Object.assign(globalThis, { fetch });
}
```

or you can pass it to this package:

```ts
import fetch from 'node-fetch';
import { downloadImages, provideFetchAPI } from 'bing-image-downloader';

provideFetchAPI(fetch);
downloadImages('A penguin', '/path/to/dir');
```
