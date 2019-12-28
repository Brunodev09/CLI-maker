import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../.env") })

import Server from "./app";
//@ts-ignore
const server = new Server([]);
server.listen();