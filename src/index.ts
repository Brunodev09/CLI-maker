#!/usr/bin/env node

import Files from "./tools/Files";
import _ from "./tools/Terminal";
import { Question } from "./tools/Header";

import Main from "./Main";

async function init() {
    try {
        const main = new Main();
        await main.run();
    } catch (e) {
        throw new Error((e || {message: e}).message);
    }

}

init();

// _.color(2);
// _.say('oi');
// _.super('teste');
// _.clear();




// (async () => {
//     await _.ask([new Question('user', 'input', 'hetttyyyyy', (value) => {
//         if (value.length) {
//             return true;
//           } else {
//             return 'Please enter your username or e-mail address.';
//           }
//     })]);

// })()
