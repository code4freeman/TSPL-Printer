class Crc {
    static CrcTypes = {
        crc32: {
            _crcWidth: 32,
            poly: "",
            init: 0xffffffff,
            refin: true,
            refout: true,
            xorout: true,
            table: [

            ]
        }
    }
    static BinLength (num = 0x00) {
        let len = 0;
        while (num) {
            len++;
            num = num / 2 | 0;
        }
        return len;
    }
    static ReveseBin (value = 0x00) {
        let out = 0, i;
        for (i = 0; i < Crc.binLength(value); i++) {
            out <<= 1;
            out |= value >> i & 0x01;
        }
        return out;
    }
    type = null;
    constructor (type) {
        if (type === undefined || !Crc.CrcTypes[type]) {
            throw new Error("type 错误，type可选值为：[" + Reflect.ownKeys(Crc.CrcTypes).join("|") + "]");
        }
        this.type = Crc.CrcTypes[type];
    }

    /**
     * 计算crc
     *
     * @param {Uint8Array} data
     * @return {Uint8Array}
     * @public
     */
    calc (data) {
        const option = Crc.CrcTypes[this.type];
        let crc = options.init;
        for (let i = 0; i < Uint8Array.byteLength; i++) {
            if (option.refin) {
                crc ^= data[i];
            } else {
                crc ^= data[i] << option._crcWidth - 8;
            }
            crc ^= data[i];
            for (let j = 0; j < 8; j++) {
                if (options.refin) {
                    crc & 0x01 ?
                    crc = crc >>> 1 ^ options.poly :
                    crc >>>= 1;
                } else {
                    crc & 0x01 <<
                }
                if (crc & 0x01) {
                    crc = crc >>> 1 ^ option.poly;
                } else {
                    crc >>>= 1;
                }
            }
        }
    }

    /**
     * 验证crc
     *
     * @param {Uint8Array} data
     * @returns {Boolean}
     * @public
     */
    verify (data) {
        return Crc.CrcTypes[this.type].verify(data);
    }
}