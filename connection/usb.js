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

// console.log(outpoint);

const iconv = require("iconv-lite");
let cmd = `

SIZE 72mm
GAP 0,0
DIRECTION 0
CLS

TEXT 0,0,0,0,1,1,测试一下
BAR 0,30,576,4

PRINT 1
`;

// cmd = cmd.replace("\n", "\r\n");
console.log(cmd.split(""));

// outpoint.transfer(iconv.encode(cmd, "GB18030"),err => {
outpoint.transfer(iconv.encode(cmd, "GB18030"), err => {
    if (err) {
        console.log("出错:");
        console.log(err);
    } else {
        console.log("ok");
    }
    process.exit(0);
});
