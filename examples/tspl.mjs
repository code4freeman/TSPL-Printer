import UsbConnection from "../src/usb.class.mjs";
import { encode, decodeText } from "GBKCodec";
import Tspl from "../src/tspl.class.mjs";
import iconv from "iconv-lite";

// const buf = encode("中国 A ");   
// console.log(buf);  
// console.log(decodeText(buf)); 

const usb = new UsbConnection;
usb.write(encode(`
SIZE 80mm,240dot
GAP 2mm,0
DIRECTION 1
CLS
BOX 32,0,320,120,1,8
PRINT 1

`)).then(process.exit);