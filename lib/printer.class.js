"use strict";

const Tspl = require("./tspl.class");
const { mixin, promisify } = require("./tool");

class Printer {
    #language = null;
    #connection = null;
    constructor () {
        this.#language = new Tspl;
        mixin(this.#language, this, key => {
            return key.startsWith("_");
        });
    }

    /**
     * 执行打印
     *
     * return {Promise<any>}
     * @public
     */
    print () {
        const buffer = new Buffer(this.#language._export());
        this.#language._init();
        return promisify(this.connection.write)(buffer);
    }
}