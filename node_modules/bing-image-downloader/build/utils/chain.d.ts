type ChainFunction<T, U> = (value: T) => U | Promise<U>;
type Chainable<T> = {
    next<U extends object>(fn: ChainFunction<T, U>): Chainable<T & U>;
    then(resolve: (value: T) => any, reject?: (reason: any) => any): Promise<any>;
};
export declare function chain<T extends object>(initialValue?: T): Chainable<T>;
export {};
