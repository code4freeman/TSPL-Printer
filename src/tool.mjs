/**
 * 扩展source的原型方法到target
 * 
 * @param {Object} source 
 * @param {Object} target 
 * @return {void}
 * @public
 */
export const expand = (source, target) => {
    Reflect.ownKeys(Object.getPrototypeOf(source)).forEach(k => {
        if (k === "constructor") return;
        Object.defineProperty(target, k, {
            enumerable: true,
            value: new Proxy(source[k], {
                apply (...[ { name: key },, args]) {
                    if (key.startsWith("_")) {
                        return source[key](...args);
                    } else {
                        source[key](...args);
                        return target;
                    }
                }
            })
        });
    });
};

/**
 * promisify
 *
 * @param {Function} fn - 错误优先回调
 * @return {Function}
 * @public
 */
export const promisify = fn => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            if (args.length !== fn.length - 1)
                reject(
                    new RangeError("[ promisify ]: 包装后传入的参数与原函数所需数量不符合！")
                );
            fn(...args, (...args) => {
                if (args[0]) {
                    reject(args[0]);
                } else {
                    resolve(...args.slice(1));
                }
            });
        });
    };
};