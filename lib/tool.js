"use strict";

/**
 * mixin
 *
 * @param source {Object}
 * @param target {Object}
 * @param exclude {Function}
 * @return {void}
 * @public
 */
exports.mixin = (
    source= {},
    target= {},
    exclude = key => {
        return false;
    },
) => {
    Reflect.ownKeys(source).forEach(k => {
        if (
            target[k] ||
            !(source[k] instanceof Function) ||
            exclude.call(source, k)
        ) return;
        Object.defineProperty(target, k, {
            enumerable: true,
            value: source[k].bind(source),
        });
    });
};

/**
 * promisify
 *
 * @param fn {Function}
 * @return {Function}
 * @public
 */
exports.promisify = fn => {
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