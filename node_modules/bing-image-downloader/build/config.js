import packageJSON from '../package.json' with { type: 'json' };
const { name } = packageJSON;
export const config = {
    fetch: fetch,
    logLevel: 4,
    cookie: process.env.BING_COOKIE || '',
};
export const setFetchAPI = (_fetch) => (config.fetch = _fetch);
export const setLogLevel = (level) => (config.logLevel = level);
export const setCookie = (cookie) => (config.cookie = cookie);
function validateFetchAPI() {
    if (!config.fetch) {
        throw new Error(`'fetch' is not defined.  Please either polyfill or set it before attempting to generate images with the ${name} package`);
    }
}
function _fetch(url, init = {}) {
    validateFetchAPI();
    const requestInit = { ...{ headers: getRequestHeaders(), ...init } };
    return config.fetch(url, requestInit);
}
export { _fetch as fetch };
export function getRequestHeaders() {
    const { cookie } = config;
    return {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7,zh;q=0.6',
        'cache-control': 'max-age=0',
        'content-type': 'application/x-www-form-urlencoded',
        'Referrer-Policy': 'origin-when-cross-origin',
        referrer: 'https://www.bing.com/images/create/',
        origin: 'https://www.bing.com',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54',
        cookie: `_U=${cookie}`,
        'sec-ch-ua': `"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"`,
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
    };
}
