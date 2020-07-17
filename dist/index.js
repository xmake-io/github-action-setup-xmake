"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const os = __importStar(require("os"));
const versions_1 = require("./versions");
const win_install_1 = require("./win-install");
const unix_install_1 = require("./unix-install");
async function run() {
    try {
        const version = await versions_1.selectVersion();
        if (os.platform() === 'win32' || os.platform() === 'cygwin')
            await win_install_1.winInstall(version);
        else
            await unix_install_1.unixInstall(version);
        await exec_1.exec('xmake --version');
    }
    catch (error) {
        const ex = error;
        core.setFailed(ex.message);
    }
}
run().catch((e) => core.error(e));
