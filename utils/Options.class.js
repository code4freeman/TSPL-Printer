"use strict";

/**
 * Options类
 */
class Options {
    /**
     * 子类用该静态字段声明参数字段以及类型
     */
    static Fields = {
        /**
         * 字段声明
         * value部分我把它称之为修饰符，解释为： `必选|类型|默认值`
         *
         * 如： key: "required|String|default"
         */
    };

    constructor (options = {}) {
        const paramsFieldError = k => new Error(`[class ${new.target.name}] 请检查options参数字段: ${k} -> ${new.target.Fields[k]}`);
        Reflect.ownKeys(new.target.Fields).forEach(k => {
            const [ isRequired, type, defaultValue ] = new.target.Fields[k].split("|");
            if (isRequired && options[k] === undefined) {
                throw paramsFieldError(k);
            } else if (
                options[k] !== undefined &&
                Object.prototype.toString.call(options[k]) !== `[object ${type}]`
            ) {
                throw paramsFieldError(k);
            } else {
                this[k] = options[k] ?? defaultValue
            }
        });
    }
}

module.exports = Options;