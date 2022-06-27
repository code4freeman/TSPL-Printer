import pixels from "get-pixels";
import { isAbsolute } from "path";
import { promisify, pixelMatrix2bitmap } from "./tool.mjs";

/**
 * 图片（png， jpg）转bitmap
 * 
 * 暂时nodejs平台下所image转bitmap所用
 * 若后面DCT解决后改写为通过用的方法，目前先不同平台
 * 的分开实现，有的平台可以使用宿主环境的相关api来实现
 * 
 * @param {String} source - 图片绝对地址
 * @return {Promise<Uint8Array>}
 * @public
 */
export default async path => {
    if (!isAbsolute(path)) 
        throw new Error(`[ bitmap_nodejs ] path 必须为绝对路径`);
        
    const { data, shape: [ width, height ] } = await promisify(pixels)(path, undefined);
    return pixelMatrix2bitmap(data, width, height);
};