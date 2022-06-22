import Printer from "#Printer";
import { encode } from "GBKCodec";

const pt = new Printer();

console.log(pt);

pt
// .barcode(16, 100, 80, "test1234")
.qrcode(216, 0, "12345678901234567890123456789012345678901234567890", 8)
.print();