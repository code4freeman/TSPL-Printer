"use strict";

/**
 * TSPL命令类
 * 这是该库的默认命令实现，主要针对支持tsc厂命令的标签打印机，也可以实现其它命令类来进行扩展
 */

const Options = require("../utils/Options.class");
const BaseComand = require("./index");
const { encode } = require("iconv-lite");
const DEFAULT_ENCODING = "GB18030";

/**
 * TSPL类的options类型，只要是该类的鸭子类型即可
 */
class TSPLOptions extends Options {
    static Fields = {
        /**
         * 宽高
         * 请按照打印机打印宽度和打印贴纸标签的高度来设置
         * tsc规定单位可以为mm，dot，inch
         * 203dpi的打印机1mm = 8dot
         * 300dpi的打印机1mm = 11.8dot （小数打印机仅会使用整数部分）
         */
        height: "|String|10mm",
        width: "|String|72mm",

        /**
         * 编码
         * 国产打印机一般为GB18030，建议参考打印机手册
         */
        encoding: `|String|${DEFAULT_ENCODING}`,

        /**
         * 打印方向
         * 0 正向
         * 1 反向
         */
        printDirection: "|Number|0"
    };

    constructor (options = {}) {
        super(options);
    }
}

class TSPL extends BaseComand {
    static TSPLOptions = TSPLOptions;
    #cmds = [];
    #options = {};
    constructor (options) {
        super();
        this.#options = new TSPLOptions(options);
        this._init();
    }

    _init () {
        const opt = this.#options;
        this.#cmds = [];
        this.#cmds.push(
            `SIZE ${opt.width},${opt.height}`,
            `DIRECTION ${opt.printDirection}`,
            `CLS`
        );
    }

    _export () {
        this.#cmds.push(`PRINT 1,1\n`);
        console.log(this.#cmds);
        return encode(this.#cmds.join("\n"), this.#options.encoding);
    }

    _computeTextLength (text) {
        const chineseCharREG = /[^\x00-\xff]/;
        let length = 0;
        for (let c of text) {
            if (chineseCharREG.test(c)) length += 2;
            else length += 1;
        }
        return length;
    }

    /**
     * 二维码
     *
     * @param {Number} x 单位是dot
     * @param {Number} y 同上
     * @param {String} ECCLevel 错误恢复级别，L,M,Q,H分别对应7%,15%,25%,30%
     * @return {TSPL}
     */
    qrcode (x, y, ECCLevel = "L", cellWidth = 5, code) {
        this.#cmds.push(`QRCODE ${x},${y},"${ECCLevel}",${cellWidth},"A",0,"${code}"`);
        return this;
    }

    /**
     * 条码打印
     * 实测所用打印机并不遵循tsc文档给出的条码类型，经测试是统一按照code 128来打印
     *
     * @param {Number} x 单位为dot
     * @param {Number} y 单位为dot
     * @param {Number} height 条码高度，单位为dot
     * @param {Number} humanReadble 条码显示状态，0不显示，1居左，2居中，3居右
     * @param {Number} size 条码大小，体现在水平方向；取值为0-2
     * @param {String} code 必须为tsc文档指出的CODE 128；简单来说可以是数字字母和一些特殊字符
     * @return {TSPL}
     */
    barcode (x, y, height, humanReadble = 2, size = 0, code) {
        const defaultSize = 2;
        const sizeMap = [ 2, 3, 4 ];
        this.#cmds.push(`BARCODE ${x},${y},128,${height},${humanReadble},0,${sizeMap[size] ?? defaultSize},${sizeMap[size] || defaultSize},${code}`);
        return this;
    }

    /**
     * 画线
     * 单位为dot，请参考打印机的dpi（见说明书）来设置，一般200dpi的打印机1mm = 8dot
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    drawLine (x, y, w, h) {
        if ([...arguments].some(v => typeof v !== "number")) throw "drawLine";
        this.#cmds.push(`BAR ${x},${y},${w},${h}`);
        return this;
    }

    /**
     * 文本绘制
     * 我实测的tsc打印机中TEXT指令支持并不完全，这里将使用hack的方式实现text的一些功能
     *
     * @param {String} x 位置，可以为dot，mm
     * @param {String} y 同上
     * @param {String} text 文本
     * @param {Number} direction 水平位置左中右对应0,1,2; 缺省为0,
     * @return {TSPL}
     */
    text (x, y, text, align = 0) {
        const textLength = this._computeTextLength(text);
        const calcDirs = [
            () => text,
            () => {
                const sideSpace = " ".repeat((47 - textLength) / 2);
                return sideSpace + text + sideSpace;
            },
            () => " ".repeat(47 - textLength) + text
        ];
        this.#cmds.push(`TEXT ${x},${y},"0",0,1,1,0,${calcDirs[align]()}`);
        return this;
    }
}

module.exports = TSPL;
