#!/usr/bin/env node

import Main from "./Main";

async function init() {
    try {
        const main = new Main();
        await main.run();
    } catch (e) {
        throw new Error((e || { message: e }).message);
    }

}

init();
