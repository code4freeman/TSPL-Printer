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
 * 像素矩阵转bitmap矩阵
 * ！打印机要求宽度字节对齐（之前的算法是不对其会补白）；现在改了，
 * 不考虑宽度字节对齐问题，若需要请搭配bitmapScaling函数缩放来完成字节对齐
 *
 * @param {Uint8Array|Array<Number>} bytes - rgba数据
 * @param {Boolean} [isReverse = false] - 是否反转像素bit，正常为1显示0不显示（来自佳博文档说明）
 * @returns {Uint8Array}
 * @public
 */
export const rgba2bitmap = (
    bytes = new Uint8Array([]),
    isReverse = false
) => {
    const bits = [];
    let i;
    for (i = 0; i < bytes.length; i += 4) {
        if (bytes[i + 3] === 0) bits.push(0);
        else
        if (
            /**
             * 平均灰度
             */
            (bytes[i] + bytes[i + 1] + bytes[i + 2]) / 3 > 255 * 0.66
        ) {
            bits.push(isReverse ? 1 : 0);
        } else {
            bits.push(isReverse ? 0 : 1);
        }
    }
    bytes = [];
    for (i = 0; i < bits.length / 8; i++) {
        let num = 0;
        for (let j = 0; j < 8; j++) {
            num = num << 1 | bits[i * 8 + j];
        }
        bytes.push(num & 0xff);
    }
    return new Uint8Array(bytes);
};

/**
 * 缩放bitmap
 * 为了兼容多平台而采用javascript实现的通用方法，
 * 建议不同平台使用宿主环境所带的的异步api来提升性能
 *
 * @param {Uint8Array|Array<Number>} bytes - bitmap数据字节
 * @param {Number} originWidth - 原图像的宽度
 * @param {Number} originHeight - 原图像的高度
 * @param {Number} targetWidth - 目标像的宽度
 * @param {Number} [targetHeight = targetWidth] - 目标图像的高度， 缺省为等比缩放
 * @returns {Uint8Array}
 * @public
 */
export const bitmapScaling = (
    bytes,
    originWidth,
    originHeight,
    targetWidth,
    targetHeight
) => {
    let msg = "";
    if (!(bytes instanceof Uint8Array) && !(bytes instanceof Array)) msg = `bytes矩阵异常`;
    else if (!originWidth) msg = `originWidth 不能省略`;
    else if (!originHeight) msg = `originHeight 不能省略`;
    else if (!targetWidth) msg = `targetWidth 不能省略`;
    if (msg) throw new Error(msg);

    if (!targetHeight) targetHeight = targetWidth;

    let bits = [], byte, i;
    for (byte of bytes) {
        for (i = 7; i > -1; i--) {
            bits.push(byte >>> i & 0x01);
        }
    }

    const ratio_x = (originWidth - 1) / targetWidth;
    const ratio_y = (originHeight - 1) / targetHeight;

    const matrix = [];

    let tx = 0, ty = 0, ox, oy;

    for (i = 0; i < targetWidth * targetHeight; i++) {
        ox = Math.round(tx * ratio_x);
        oy = Math.round(ty * ratio_y);

        matrix[ ty * targetWidth + tx ] = bits[ oy * originWidth + ox ];
        if (tx + 1 === targetWidth) {
            ty++;
            tx = 0;
        } else {
            tx++;
        }
    }

    bytes = [];
    let j;
    for (i = 0; i < matrix.length / 8; i++) {
        byte = 0;
        for (j = 0; j < 8; j++) {
            byte = byte << 1 | matrix[ i * 8 + j ];
        }
        bytes.push(byte);
    }

    return new Uint8Array(bytes);
};