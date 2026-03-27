export function chain(initialValue = {}) {
    let value = Promise.resolve({ ...initialValue });
    return {
        next(fn) {
            value = value.then(async (currentValue) => {
                if (Array.isArray(fn)) {
                    const results = await Promise.all(fn.map((f) => f(currentValue)));
                    return results.reduce((acc, result) => ({ ...acc, ...(result || {}) }), currentValue);
                }
                else {
                    const result = await fn(currentValue);
                    return { ...currentValue, ...(result || {}) };
                }
            });
            return this;
        },
        then(resolve, reject) {
            return value.then(resolve, reject);
        },
    };
}
