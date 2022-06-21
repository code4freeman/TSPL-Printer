class TsplOptions {
    /**
     * 所有的字段配置都是可选的，若传入的options无对应字段，则采用该结构里的初始值为默认值
     * 设置参数请参考文档：http://inside.lilin.site:5000/sharing/IlAq1Gge7
     */
    static Fields = {
        size: "80mm 50mm",
        direction: 1,
        gap: "2mm 0mm",
        reference: 80, // 单位只支持dot
    };

    static Options2Tspl = ((option = {}) => {
        return Reflect.ownKeys(TsplOptions.Fields).map(k => `${k.toUpperCase()} ${option[k]}`);
    });

    constructor (options = {}) {
        /**
         * 鸭儿类型匹配即可，不需要严格继承
         */
        const option = Object.create(null);
        Reflect.ownKeys(TsplOptions.Fields).forEach(k => {
            Object.defineProperty(option, k, {
                configurable: true,
                value: options.hasOwnProperty(k) && option[k] !== undex ? options[k] : TsplOptions.Fields[k]
            });
        });
        return option;
    }
}

class Tspl {
    static Options = TsplOptions;
    #chars = [];
    #option = {};

    constructor (option = {}) {
        this.#option = new TsplOptions(option);
        this._init();
    }

    _init () {
        this.#chars = TsplOptions.Options2Tspl(this.#option);
        this.#chars.push("CLS");
    }

    _export () {
        return [...this.#chars, "PRINT 1"].join("\r\n") + "\r\n";
    }

    /**
     * 打印色彩密度
     *
     * @param {Number} [density=15] - 密度值0~15
     * @return {void}
     * @public
     */
    density (density = 15) {
        this.#chars.push(`DENSITY ${density}`);
    }

    /**
     * 走纸
     *
     * @param {Number} [dot=1] - 进纸张点数，具体的点数dpi、请参考打印机参数
     * @return {void}
     * @public
     */
    feed (dot = 1) {
        this.#chars.push(`FEED ${dot}`);
    }

    /**
     * 反向走纸
     *
     * @param {Number} [dot=1] 
     * @return {void}
     * @public
     */
    backFeed (dot = 1) {
        this.#chars.push(`BACKFEED ${dot}`);
    }

    /**
     * 单行文本
     * 中文字符等于2个英文字符，字符的打印宽度参考文档对应字体说明
     * tspl与escpos不一样，单行文本不会自动处理换行
     * 
     * @param {Number} [x=0] - x dot 
     * @param {Number} [y=0] - y dot
     * @param {String} [text=""] - 字符串
     * @param {Number} [scale=2] - 缩放倍数，1~15
     * @public
     */
    text (
        x = 0, 
        y = 0, 
        text = "", 
        scale = 2,
    ) {
        this.#chars.push(`TEXT ${x},${y},"1",0,${scale},${scale},"${text}"`);
    }

     /**
     * 文本段落，自动处理换行
     * 中文字符等于2个英文字符，字符的打印宽度参考文档对应字体说明
     * 所有参数的单位均为点，具体数值自己计算
     * ！建议在打印标签时业务逻辑层面需要限制打印字符数，避免超出宽后漏打印
     * 
     * @param {Number} [x=0] - x dot 
     * @param {Number} [y=0] - y dot
     * @param {Number} [width=0] - 宽
     * @param {Number} [height=0] - 高
     * @param {String} [text=""] - 字符串
     * @param {Number} [scale=2] - 缩放倍数，1~15
     * @param {Number} [lineSpace=1] - 行间距
     * @return {void}
     * @public
     */
    block (...[
        x = 0, 
        y = 0, 
        width = 0,
        height = 0,
        text = "", 
        scale = 2,
        lineSpace = 1
    ]) {
        this.#chars.push(`BLOCK ${x},${y},${width},${height},"1",0,${scale},${scale},${lineSpace},"${text}"`);
    }

    /**
     * 绘制色块，当然也可以绘制线条
     * 
     * @param {Number} x 
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {void}
     * @public
     */
    bar (...[
        x,y,width,height
    ]) {
        this.#chars.push(`BAR ${x},${y},${width},${h}`);
    }

    /**
     * 绘制盒子
     * 所有单位都为点
     * 
     * @param {Number} [x=0] - x轴开始
     * @param {Number} [y=0] - y轴开始
     * @param {Number} xEnd
     * @param {Number} yEnd
     * @param {Number} [lineThickness = 1] - 线条粗度
     * @param {Number} [radius=0] - 圆角半径
     * @return {void}
     * @public
     */
    box (...[
        x = 0,
        y = 0,
        xEnd,
        yEnd,
        lineThickness = 1,
        radius = 0
    ]) {
        this.#chars.push(`BOX ${x},${y},${xEnd},${yEnd},${lineThickness},${radius}`);
    }

}

export default Tspl;