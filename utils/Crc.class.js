class Crc {
    static CrcTypes = {
        crc32: {
            poly: "",
            init: 0xffffffff,
            refin: true,
            refout: true,
            xorout: true
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
    static revesebin (value = 0x00) {
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
    build (data) {

    }
    verify (data) {

    }
}

function getBinNumber (num = 0x00) {
    let count = 0;
    let str = "";
    while (num) {
        str = num % 2 + str;
        num = num / 2 | 0;
        count++;
    }
    return [ count, str ];
}

let v = 32;
console.log((v).toString(2).length, getBinNumber(v));