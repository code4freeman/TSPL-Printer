"use strict";

import { getDeviceList } from "usb";
import { promisify } from "./tool.mjs";

const PRINTER_TYPE = 0x07;

class UsbConnection {
    #events = {
        data: () => {},
        error: () => {}
    }
    #inpoint = null;
    #outpoint = null;

    on (ename, cb) {
        this.#events[ename] = cb;
    }

    constructor () {
        /**
         * 暂时以电脑打印机中的第一个打印机为准
         * 后续增加该类初始化参数，指定vid/pid来选取设备或者使用第一个设备作为默认设备
         */
        const device = getDeviceList().filter(d => {
            return d.configDescriptor.interfaces.filter(arr => {
                return arr.filter(inf => {
                    return inf.bInterfaceClass === PRINTER_TYPE;
                })[0];
            })[0];
        })[0];
        device.open();
        device.interfaces?.[0].claim();
        [ this.#inpoint, this.#outpoint ] = device.interfaces[0].endpoints;
        this.#inpoint.on("data", chunk => {
            console.log("data ->");
            this.#events.data(chunk);
        });
        this.#inpoint.on("error", err => {
            console.log("error ->");
            this.#events.error(err);
        });
        this.#inpoint.startPoll();
    }

    write (buffer) {
        return promisify(this.#outpoint.transfer.bind(this.#outpoint))(buffer);
    }
};

export default UsbConnection;