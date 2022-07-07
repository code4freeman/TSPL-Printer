import pixels from "get-pixels";
import { isAbsolute } from "path";
import { promisify, rgba2bitmap, bitmapScaling } from "./tool.mjs";

/**
 * 图片（png， jpg）转bitmap
 * 
 * 暂时nodejs平台下所image转bitmap所用
 * 若后面DCT解决后改写为通过用的方法，目前先不同平台
 * 的分开实现，有的平台可以使用宿主环境的相关api来实现
 * 
 * @param {String} source - 图片文件路径（必须为绝对地址）
 * @param {Boolean} [isReverse = true] - 图片是否反相
 * @param {Number} targetWidth - 图片的输出宽度（注意尺寸，打印机要求字节对齐）
 * @param {Number} [targetHeight = targetWidth] - 图片输出高度，缺省则为等比缩放（按照targetWidth来等比缩放）
 * @return {Promise<Uint8Array>}
 * @public
 */
export default async (
    path,
    isReverse = false,
    targetWidth,
    targetHeight
) => {
    if (!isAbsolute(path)) 
        throw new Error(`[ bitmap_nodejs ] path 必须为绝对路径`);
    if (typeof isReverse !== "boolean") {
        if (typeof isReverse !== "number") throw new Error(`[ bitmap_nodejs ] targetWidth必须指定且只能为Number类型`);
        if (typeof targetWidth !== "number") throw new Error(`[ bitmap_nodejs ] targetHeight必须赋值且只能为Number类型`);
        targetHeight = targetWidth || isReverse;
        targetWidth = isReverse;
        isReverse = false;
    } else {
        if (typeof targetWidth !== "number" || (targetHeight !== undefined && typeof targetHeight !== "number"))
            throw new Error(`[ bitmap_nodejs ] targetWidth、targetHeight必须指定且只能为Number类型`);
        else
            targetHeight = targetHeight || targetWidth;
    }
        
    let { data, shape: [ width, height ] } = await promisify(pixels)(path, undefined);
    data = rgba2bitmap(data, !isReverse /** TSPL文档中规定0为显示 */);
    return bitmapScaling(data, width, height, targetWidth, targetHeight);
};