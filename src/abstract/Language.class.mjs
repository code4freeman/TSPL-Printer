/**
 * 语言抽象类
 *
 * @class
 */
export default class Language {

    /**
     * 初始化打印机语言，一般在在_export()导出缓存后调用重置
     * 约定用于上层调用
     * 
     * @return {void}
     * @abstract
     */
    _init () {
        throw new Error(`[ Language ] 必须实现该方法`);
    }

    /**
     * 导出命令缓存
     * 
     * @returns {Uint8Array}
     * @abstract
     */
    _export () {
        throw new Error(`[ Language ] 必须实现该方法`);
    }
}