"use strict";

/**
 * command类的基础类，定义了一些派生类必须实现的方法
 * command层的lei必须继承该类来实现
 */
class BaseCommand {
    /**
     * 初始化内部数据
     * 如命令队列，用于给printer层调用该类export方法后重置该类的数据用
     *
     * @private
     */
    _init () {
        throw new Error("请实现该方法！");
    }

    /**
     * 导出命令buffer的方法，用于printer层打印的时候调用
     * 该方法不会给用户直接调用
     *
     * @return {Buffer}
     * @private
     */
    _export () {
        throw new Error("请实现该方法！");
    }

    /**
     * 其它的具体的方法自由实现，但是不能以“_”为前缀
     * 自由实现的这些方法将会mixin到printer层供用户调用
     */
}

module.exports = BaseCommand;