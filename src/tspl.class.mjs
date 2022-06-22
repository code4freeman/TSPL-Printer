class TsplOptions {
    /**
     * 所有的字段配置都是可选的，若传入的options无对应字段，则采用该结构里的初始值为默认值
     * 设置参数请参考文档：http://inside.lilin.site:5000/sharing/IlAq1Gge7
     */
    static Fields = {
        size: "80mm,50mm",
        direction: 1,
        gap: "2mm,0", // ！实测后面的0跟mm单位会导致测试打印机工作与label模式
        reference: 0, // 单位只支持dot

        /**
         * 若没有编码器会直接缓存tspl字符，上层调用_export时请自行编码
         * 指定编了码器会直接缓存tspl字节流，方便bitmap字节流的插入
         * 
         * 编码器签名：(string) => Uint8Array
         */
        encoder: undefined
    };

    static Options2Tspl = ((option = {}) => {
        return Reflect.ownKeys(TsplOptions.Fields)
                .filter(k => ["string", "number"].includes(typeof option[k]))
                .map(k => `${k.toUpperCase()} ${option[k]}`);
    });

    constructor (options = {}) {
        /**
         * 鸭儿类型匹配即可，不需要严格继承
         */
        const option = Object.create(null);
        Reflect.ownKeys(TsplOptions.Fields).forEach(k => {
            Object.defineProperty(option, k, {
                configurable: true,
                value: options.hasOwnProperty(k) && options[k] !== undefined ? options[k] : TsplOptions.Fields[k]
            });
        });
        return option;
    }
}

class Tspl {
    static Options = TsplOptions;
    #cache = [];
    #option = {};

    constructor (option = {}) {
        this.#option = new TsplOptions(option);
        this._init();
    }

    #append (tspl) {
        if (this.#option.encoder) {
            this.#cache = [...this.#cache, ...this.#option.encoder("\r\n" + tspl)];
        } else {
            this.#cache.push(tspl);
        }
        return this;
    }

    _init () {
        this.#cache = [];
        const init = TsplOptions.Options2Tspl(this.#option);
        init.push("CLS");
        this.#append(init.join("\r\n"));
    }

    _export () {
        if (this.#option.encoder) {
            return new Uint8Array(
                [...this.#cache, ...this.#option.encoder("\r\nPRINT 1\r\n")]
            );
        } else {
            return [...this.#cache, "PRINT 1,1"].join("\r\n") + "\r\n";
        }
    }

    
    /**
     * ！ 根据约定，下划线开头的方法为language层必须带的，命名固定且最终由上一层来调
     * 用；不带下划线的方法均为功能方法，命名自由。功能方法最终会mixin到上一层作为功
     * 能方法映射，但是届时的this指向有变动，内部执行时的this指向Tspl，而返回的this
     * 指向上一层的实例。   
     */


    /**
     * 打印色彩密度
     *
     * @param {Number} [density=15] - 密度值0~15
     * @return {Tspl}
     * @public
     */
    density (density = 15) {
        return this.#append(`DENSITY ${density}`);
    }

    /**
     * 走纸
     *
     * @param {Number} [dot=1] - 进纸张点数，具体的点数dpi、请参考打印机参数
     * @return {Tspl}
     * @public
     */
    feed (dot = 1) {
        return this.#append(`FEED ${dot}`);
    }

    /**
     * 反向走纸
     *
     * @param {Number} [dot=1] 
     * @return {Tspl}
     * @public
     */
    backFeed (dot = 1) {
        return this.#append(`BACKFEED ${dot}`);
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
     * @return {Tspl}
     * @public
     */
    text (
        x = 0, 
        y = 0, 
        text = "", 
        scale = 2,
    ) {
        return this.#append(`TEXT ${x},${y},"1",0,${scale},${scale},"${text}"`);
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
     * @return {Tspl}
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
        return this.#append(`BLOCK ${x},${y},${width},${height},"1",0,${scale},${scale},${lineSpace},"${text}"`);
    }

    /**
     * 绘制色块，当然也可以绘制线条
     * 
     * @param {Number} x 
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @return {Tspl}
     * @public
     */
    bar (
        x,
        y,
        width,
        height
    ) {
        return this.#append(`BAR ${x},${y},${width},${height}`);
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
     * @return {Tspl}
     * @public
     */
    box (
        x = 0,
        y = 0,
        xEnd,
        yEnd,
        lineThickness = 1,
        radius = 0
    ) {
        return this.#append(`BOX ${x},${y},${xEnd},${yEnd},${lineThickness},${radius}`);
    }

    /**
     * 蜂鸣器
     * 
     * @param {Number} [count=1] - 鸣叫次数
     * @param {Number} [time=200] - 单次鸣叫时间，单位ms
     * @return {Tspl}
     * @public
     */
    sound (count = 1, time = 200) {
        return this.#append(`SOUND ${count},${time}`);
    }

    /**
     * 条码,这里固定为code128
     * 单位都为dot
     * 
     * @param {Number} [x=0] - x
     * @param {Number} [y=0] - y
     * @param {Number} [height=80] - height
     * @param {String} [content=""] - 条码内容，请遵循code128的约定，不是啥字符都可以往里边放的
     * @param {Boolean} [label=true] - 是否显示条码的label部分
     * @param {Number} [rotate=0] - 旋转角度，支持0,90,180,270
     * @param {Number} [elementWidth=2] - 条码每位宽度
     * @return {Tspl}
     * @public
     */
    barcode ( 
        x = 0, 
        y = 0,
        height = 80,
        content = "",
        label = true,
        rotate = 0,
        elementWidth = 2
    ) {
        return this.#append(`BARCODE ${x},${y},"128",${height},${+label},${rotate},${elementWidth},${elementWidth},"${content}"`);
    }

    /**
     * 二维码
     * 所有单位都为dot
     * 
     * @param {Number} [x=0]
     * @param {Number} [y=0]
     * @param {String} [content=""] - 内容
     * @param {Number} [cellSize=5] - 单元大小，0~10取值
     * @param {Number} [rotate=0] - 二维码旋转角度，取值0，90，180，270
     * @param {String} [eccLevel="H"] - 容错率，取值L、M、Q、H
     * @return {Tspl}
     * @public
     */
    qrcode (
        x = 0,
        y = 0,
        content = "", 
        cellSize = 5, 
        rotate = 0,
        eccLevel = "H"
    ) {
        return this.#append(`QRCODE ${x},${y},${eccLevel},${cellSize},A,${rotate},"${content}"`);
    }

    /**
     * 打印图片
     * 单位为dot，除非参数有单独说明
     * 
     * @param {Number} [x=0]
     * @param {Number} [y=0]
     * @param {Number} width - x轴像素单位，不是dot
     * @param {Number} height
     * @param {Uint8Array|Array} source
     * @param {Number} [mode=0]
     * @return {Tspl}
     * @public
     */
    bitmap (
        x = 0,
        y = 0,
        width,
        height,
        source,
        mode = 0
    ) {
        if (!this.#option.encoder) 
            throw new Error(`[ btimap ] 方法必须需要为Tspl option类传入encoder`);
        if (!(source instanceof Uint8Array) && !Array.isArray(source))
            throw new Error(`[ bitmap ] 方法source参数类型错误`);

        this.#append(`BITMAP ${x},${y},${width},${height},${mode},`);
        this.#cache = [...this.#cache, ...source];
        return this;
    }
}

export default Tspl;