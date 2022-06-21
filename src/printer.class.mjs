import Tspl from "./tspl.class.mjs";
import { expand } from "./tool.mjs";
import UsbConnection from "./usb.class.mjs";
import { encode } from "GBKCodec";

class Printer {
    #language = null;
    #connection = new UsbConnection;
    constructor () {
        this.#language = new Tspl;
        expand(this.#language, this);
    }

    print () {
        console.log(this.#language._export());
        const buffer = encode(this.#language._export());
        this.#language._init();
        return this.#connection.write(buffer);
    }
}

export default Printer;