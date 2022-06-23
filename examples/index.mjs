import Printer from "#Printer";
import Usb from "#Usb";
import Tspl from "#Tspl";
import bitmap_nodejs from "#bitmap_nodejs";
import { resolve } from "path";
import { encode as encoder } from "GBKCodec";

/**
 * 票据模式打印示例
 */
const t1 = async () => {
    const print = new Printer({
        connection: new Usb,
        language: new Tspl({
            size: "75mm, 120mm",
            encoder
        })
    });

    const bitmap = await bitmap_nodejs(resolve("./github160x160.png"));
    await print
    .bitmap(0, 160, 20, 160, bitmap)
    .text(176, 213, "https://github.com/lilin", 2)
    .text(176, 245, "dog/tspl-printer", 2)
    .bar(0, 340, 600, 8)
    .qrcode(0, 370, "https://github.com/lilindog")
    .text(200, 420, "TSPL-Printer", 4)
    .bar(0, 568, 600, 2)
    .barcode(0, 586, 160, "123456ABCDEFG", true, 3)
    .bar(0, 786, 600, 2)
    .block(0, 812, 600, 400, "对技术有追求的javascript程序猿，现已躺平；但追求技术的脚步不会停止。", 2, 8)
    .bar(0, 910, 600, 8)
    .text(0, 928, "E-mail: lilin@lilin.site")

    .print();
};

/**
 * 标签模式打印示例
 */
const t2 = async () => {
    const print = new Printer({
        connection: new Usb,
        language: new Tspl({
            size: "70mm, 50mm",
            gap: "2mm, 0mm",
            encoder
        })
    });

    const bitmap = await bitmap_nodejs(resolve("./github80x80.png"));
    await print
    .bitmap(0, 0, 10, 80, bitmap)
    .text(104, 24, "https://github.com/lilindog", 2)
    .bar(0, 96, 560, 4)
    .qrcode(0, 110, "https://github.com/lilindog")
    .text(180, 170, "TSPL-Printer", 4)
    .bar(0, 290, 560, 4)    
    .text(0, 316, "E-mail:lilin@lilin.site")

    .print();
};

t2()
.then(setTimeout.bind(null, process.exit, 2000))
.catch(console.error);