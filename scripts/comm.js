"use strict"

const { spawn } = require("child_process");
const platform = require("os").platform();

exports.runCmds = async function (cmds = []) {
    const codes = [];
    for (let cmd of cmds) codes.push(await new Promise((resolve, reject) => {
        cmd = cmd.replace(/\s+/g, " ").split(" ");
        const p = spawn(cmd.shift(), cmd, { stdio: "inherit", shell:  platform === "win32" ? true : false });
        p.on("exit", resolve);
        p.on("error", reject);
    }));
    return codes.every(code => code === 0);
}