export declare const config: {
    fetch: typeof fetch;
    logLevel: number;
    cookie: string;
};
export declare const setFetchAPI: (_fetch: typeof fetch) => typeof fetch;
export declare const setLogLevel: (level: number) => number;
export declare const setCookie: (cookie: string) => string;
declare function _fetch(url: string, init?: RequestInit): Promise<Response>;
export { _fetch as fetch };
export declare function getRequestHeaders(): {
    accept: string;
    'accept-encoding': string;
    'accept-language': string;
    'cache-control': string;
    'content-type': string;
    'Referrer-Policy': string;
    referrer: string;
    origin: string;
    'user-agent': string;
    cookie: string;
    'sec-ch-ua': string;
    'sec-ch-ua-mobile': string;
    'sec-fetch-dest': string;
    'sec-fetch-mode': string;
    'sec-fetch-site': string;
    'sec-fetch-user': string;
    'upgrade-insecure-requests': string;
};
