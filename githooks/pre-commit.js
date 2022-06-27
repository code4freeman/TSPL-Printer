"use strict"

const { runCmds } = require("../scripts/comm");

!async function () {
    if (!await runCmds(["npm run lint"])) {
        console.log("\n): 代码 eslint 检测不通过, 请检查规范！\n");
        process.exit(1);
    } else {
        console.log("\n(: eslint 代码检测通过\n");
    }

    // if (!await runCmds(["npm test"])) {
    //     console.log("\n): 单元测试不通过，请重新检查！");
    //     process.exit(1);
    // } else {
    //     console.log("\n(: 单元测试通过");
    // }
}();
