import { escape } from 'querystring';
import { resolve } from 'path';
import { fetch } from './config.js';
import { log } from './log.js';
import { sleep } from './utils/sleep.js';
import { truthy } from './utils/filter.js';
import { chain } from './utils/chain.js';
const POLL_TIMEOUT_SEC = 30;
const BASE_URL = 'https://www.bing.com/images/create';
const BLOCKED_TEXT = 'This prompt has been blocked';
// ERROR MESSAGES
const UNEXPECTED_RESPONSE = 'Unexpected response';
const UNABLE_TO_GENERATE = 'Unable to generate images';
const POLL_TIMEOUT = 'Timed out waiting for image generation';
const BLOCKED_RESPONSE = 'Bing has blocked this prompt as unsafe';
const NO_IMAGES = 'No images found in response page';
const BAD_MATCH = 'Failed to parse images out of resposne page';
export async function fetchImageURLs(prompt) {
    const { generatedImageURLs } = await chain({ prompt })
        .next(encodePrompt)
        .next(getQueryURL)
        .next(fetchQueryPage)
        .next(extractRequestID)
        .next(getImagePageURL)
        .next(awaitImageGen)
        .next(parseResponsePage);
    return generatedImageURLs;
}
const getQueryURL = ({ encodedPrompt }) => ({
    queryURL: `${BASE_URL}/?q=${encodedPrompt}&rt=3&FORM=GENCRE`,
});
const getImagePageURL = ({ requestID, encodedPrompt, }) => ({
    imagePageURL: `${BASE_URL}/async/results/${requestID}?q=${encodedPrompt}`,
});
const encodePrompt = ({ prompt }) => ({
    encodedPrompt: escape(prompt),
});
function validatePageHTML(html) {
    if (html.indexOf(BLOCKED_TEXT) > 0) {
        throw new Error(BLOCKED_RESPONSE);
    }
}
async function fetchQueryPage({ prompt, queryURL }) {
    log(`Fetching image URLs for "${prompt}"`, 2);
    const queryResponse = await fetch(queryURL, { method: 'POST' });
    if (queryResponse.status !== 200 || !queryResponse.redirected) {
        const responseHTML = await queryResponse.text();
        log(`Exepcted to be redirected`, 1);
        log(responseHTML, 0, resolve('./request-1.html'));
        validatePageHTML(responseHTML);
        // the above parser should hopefully catch whatever error message, but in case it doesn't...
        throw new Error(UNEXPECTED_RESPONSE);
    }
    return { queryResponse };
}
const extractRequestID = ({ queryResponse }) => {
    const requestID = new URL(queryResponse.url).searchParams.get('id');
    if (!requestID) {
        log(`ID not found in response url querystring`, 1);
        throw new Error(UNEXPECTED_RESPONSE);
    }
    return { requestID };
};
async function awaitImageGen({ imagePageURL }) {
    const startPolling = Date.now();
    log(`Polling ${imagePageURL}`, 1);
    while (true) {
        if (Date.now() - startPolling > POLL_TIMEOUT_SEC * 1000) {
            throw new Error(POLL_TIMEOUT);
        }
        const pollResult = await fetch(imagePageURL);
        if (pollResult.status !== 200) {
            throw new Error(UNABLE_TO_GENERATE);
        }
        const html = await pollResult.text();
        log(html, 0, resolve('./request-2.html'));
        if (html) {
            return { imagePageHTML: html };
        }
        else {
            await sleep(1000);
        }
    }
}
function parseResponsePage({ imagePageHTML }) {
    validatePageHTML(imagePageHTML);
    const matchedCreateURLs = imagePageHTML.matchAll(/<div class="imgpt"><a\b[^>]+?href="\/images\/create\/.*?<img\b[^>]+?src="(http.*?)"/gm);
    const generatedImageURLs = [...matchedCreateURLs]
        .map((match) => {
        // this shouldn't ever happen, but since I'm being lazy and parsing html with a regex...
        if (match[0].indexOf('</a>') > 0) {
            throw new Error(BAD_MATCH);
        }
        return match[1];
    })
        .filter(truthy);
    if (generatedImageURLs.length === 0) {
        throw new Error(NO_IMAGES);
    }
    return { generatedImageURLs };
}
