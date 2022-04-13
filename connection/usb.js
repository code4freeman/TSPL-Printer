"use strict";

const { getDeviceList, usb } = require("usb");

// console.log(getDeviceList());
// console.log(usb);

const printers = getDeviceList().filter(d => {
    return d.configDescriptor?.interfaces.some(arr => {
        return arr.some(ifc => ifc.bInterfaceClass === 0x07)
    });
});

const [ printer ] = printers;

printer.open();
printer.interfaces[0].claim();
const { outpoint } = printer.interfaces[0]?.endpoints?.reduce((res, point) => {
    if (point.direction === "out") {
        res.outpoint = point;
    }
    return res;
}, {});

const TSPL = require("../command/TSPL.class");
let cmd = new TSPL({ height: "5mm" });

// const cmd = `
//
// SIZE 72mm,50mm
// DIRECTION 0
// GAP 5mm
// OFFSET 20mm
// CLS
//
// TEXT 0,0,0,0,1,1,测试文字TEST_TEXT
// BAR 0,30,576,2
//
// PRINT 1
// `;

cmd.drawLine(0, 0, 576, 4);

// outpoint.transfer(iconv.encode(cmd, "GB18030"),err => {
outpoint.transfer(cmd._export(), err => {
    if (err) {
        console.log("出错:");
        console.log(err);
    } else {
        console.log("ok");
    }
    process.exit(0);
});
