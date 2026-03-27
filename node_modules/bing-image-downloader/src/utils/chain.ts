type ChainFunction<T, U> = (value: T) => U | Promise<U>;
type Chainable<T> = {
  next<U extends object>(fn: ChainFunction<T, U>): Chainable<T & U>;
  then(resolve: (value: T) => any, reject?: (reason: any) => any): Promise<any>;
};

export function chain<T extends object>(initialValue: T = {} as T): Chainable<T> {
  let value: Promise<T> = Promise.resolve({ ...initialValue });

  return {
    next<U extends object>(fn: ChainFunction<T, U> | ChainFunction<T, U>[]): Chainable<T & U> {
      value = value.then(async (currentValue) => {
        if (Array.isArray(fn)) {
          const results = await Promise.all(fn.map((f) => f(currentValue)));
          return results.reduce((acc, result) => ({ ...acc, ...(result || {}) }), currentValue);
        } else {
          const result = await fn(currentValue);
          return { ...currentValue, ...(result || {}) };
        }
      });

      return this as Chainable<T & U>;
    },
    then(resolve, reject) {
      return value.then(resolve, reject);
    },
  };
}
