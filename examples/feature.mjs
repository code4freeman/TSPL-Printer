import UsbConnection from "../src/usb.class.mjs";
import { encode, decodeText } from "GBKCodec";
import Tspl from "../src/tspl.class.mjs";
import iconv from "iconv-lite";
import { resolve } from "path";
import { bitmap_nodejs } from "../src/image2bitmap.mjs";
import fs from "fs";

// const buf = encode("中国 A ");   
// console.log(buf);  
// console.log(decodeText(buf)); 

const usb = new UsbConnection;
const tspl = new Tspl({ encoder: encode });

const T = !true;

if (T) {

usb.write(encode
(`

SIZE 80mm,50mm
DIRECTION 1
GAP 2mm,0mm
CLS
BAR 0,0,80,2
PRINT 1

`)
).then(process.exit);


} else {

    bitmap_nodejs(resolve("./500x500.png"))
    .then(source => {
        console.log(source.length);
        console.log(Math.sqrt(source.length));
        tspl
        .density(1)
        .text(0, 0, "你好test123456", 2)
        .bitmap(0, 30, 63, 500, source);
        const s = decodeText(tspl._export());
        fs.writeFileSync("./test.bin", s);
        usb.write(tspl._export()).then(process.exit);
    });
}

