/**
 * 连接抽象类
 *
 * @class
 */
export default class Connection {

    /**
     * 连接的上行数据通过下面的数据集合派发
     *
     * @type {Object}
     * @protected
     */
    _events = {
        data: () => {},
        error: () => {}
    }
    
    /**
     * 注册监听器
     * 
     * @param {String} ename - 事件名
     * @param {Function} cb - cb的签名：const cb = (data) => void
     * @return {void}
     * @public
     */
    on (ename, cb) {
        if (!this._events[ename])
            throw new Error(`[${ new.target.name }] 没有${ename}事件, 请参考：${Reflect.ownKeys(this._events).join("、")}`);
        this._events[ename] = typeof cb === "function" ? cb : () => {};
    }

    /**
     * 写数据到连接
     * 
     * @return {Promise}
     * @abstract
     */
    write () {
        throw new Error(`[ Connection ] 实现类必须实现该方法`);
    }
}