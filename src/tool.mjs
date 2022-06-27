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

/**
 * rgab转bitmap
 * 
 * @param {Uint8Array|Array} source - rgb/rgba数据源
 * @param {Number} width - 矩阵宽度
 * @param {Number} height - 矩阵高度
 * @return {Uint8Array}
 * @public
 */
export const pixelMatrix2bitmap = (
    source, 
    width, 
    height
) => {
    if (!Array.isArray(source) && !(source instanceof Uint8Array))
        throw new Error(`[ rgb2bitmap ] source必须为Array或Uint8Array类型`);
    if (
        (!height || Number(height) === NaN) || 
        (!width || Number(width) === NaN)
    )
        throw new Error(`[ rgb2bitmap ] height、width参数必须为Number且不能省略`);

    const pixels = Array.from(source);
    const binary = [];
    for (let i = 0; i < pixels.length; i += 4) {
        const pixel = {
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2],
            a: pixels[i + 3]
        };
        if (pixel.a === 0) {
            binary.push(1);
            continue;
        }
        const gray = parseInt((pixel.r + pixel.g + pixel.b) / 3);
        binary.push(gray > 170 ? 1 : 0);
    }

    const bytes = [];
    const xCount = Math.ceil(width / 8);
    for (let n = 0; n < height; n++) {
        for (let x = 0; x < xCount; x++) {
            let byte = 0x00;
            for (let i = 0; i < 8; i++) {
                if (binary[n * width + x * 8 + i]) {
                    byte |= 0x80 >> i;
                }
            }
            bytes.push(byte);
        }
    }
    return new Uint8Array(bytes);
};