import Files from "./tools/Files";
import _ from "./tools/Terminal";
import metadata from "../template.json";
import { Question, Checkbox } from "./tools/Header";

export default class Main {

    target: string;
    completeTarget: string;
    project: any;
    cmds: string[];
    templateDir: string;

    constructor() {
        this.target = "";
        this.completeTarget = "";
        this.templateDir = __dirname + '/templates';
        this.project = "";
        this.cmds = [];
    }

    async confete(): Promise<boolean> {
        const dice = Math.floor(Math.random() * 3);
        let color;
        switch (dice) {
            case 0:
                color = 'red';
                break;
            case 1:
                color = 'green';
                break;
            case 2:
                color = 'blue';
                break;
        }
        _.clear();
        _.super('brunodev09 - CLI', color);
        return await _.ask([new Question("input", "start", "Type 'start' to execute this package.", async (value) => {
            switch (value.toUpperCase()) {
                case "START":
                    return true;
                default:
                    return false;
            }
        })])
    }

    async createNewTemplate() {
        let val;
        await _.ask([new Question("input", "temp", "Please type the name of the root folder.", (value) => {
            if (value.length) {
                val = value;
                return true;
            }
            return false;
        })]);
        const folderName = val;
        if (await Files.isDir(this.target + `/${folderName}`)) {
            _.say(`There is already a folder named ${folderName} on ${this.target}.`, 'red');
            process.exit(1);
        }
        await Files.createDir(this.target + `/${folderName}`);
        this.completeTarget = this.target + `/${folderName}`;
    }

    async run() {

        this.target = process.env.INIT_CWD || process.cwd();
        let confete = await this.confete();
        await this.createNewTemplate();
        this.project = await this.select();

        // this.target = __dirname;

        try {
            _.say(`Attempting to execute commands...`);
            let promiseCmds = await this.commands();
            if (promiseCmds === "CMDS_FINISHED") _.say('Commands have been executed.');
        } catch (e) {
            if (e && e.message && e.message === "NO_CMDS") {
                _.say("No available commands! Proceeding to check template JSON structure.", "yellow");
            }
            else _.say((e || { message: e }), 'red');
        }

        try {
            await this.folderStructure();
        } catch (e) {
            if (e && e.message && e.message.includes("FILE_NOT_FOUND_")) {
                let s = e.message.split('_');
                const index = s[s.length - 1];
                const FILE_NOT_FOUND = this.project["root"][index];
                _.say(`File ${FILE_NOT_FOUND} was not found in the folder \'./templates\`.`, 'red');
                _.say(`Please make sure all files you want generated are included in the \'./templates\` folder of this project sourcecode.`, 'red')
                process.exit(1);
            }
            _.say((e || { message: e }), 'red');
        }

    }
    // @TODO - Tipefy the JSON template. 
    // @TODO - Add the option to process everything inside current dir instead of creating a new folder everytime.
    // @TODO - Make creation of template files in ./dist automatic
    async select(): Promise<any> {
        let choices = [];
        let projects = {};

        for (let each of metadata.templates) {
            choices.push(each.projectName);
            projects[each.projectName] = each;
        }

        let question = await _.ask([new Checkbox('checkbox', 'project',
            'Select the template you want to initialize:',
            choices,
            ['No templates found!'])]);
        if (!question.project.length) {
            _.say('You have not selected any templates. Shutting down service.', 'red');
            process.exit(1);
        }
        if (question.project.length > 1) {
            _.say('You can only select ONE template. Shutting down service.', 'red');
            process.exit(1);
        }

        return projects[question.project[0]];
    }

    async commands(): Promise<any> {
        return new Promise(async (resolve, reject) => {

            if (!this.project.commands.length) reject("NO_CMDS");

            for (let command of this.project.commands) {

                let thread = new Promise(async (resolve, reject) => {

                    let c = await require('child_process').execSync(command,
                        { cwd: this.templateDir },
                        (err, stdout, stderr) => {
                            if (stderr || err) reject(stderr || err);
                            _.say(`[CHILD] ${stdout}`, 'blue')
                            resolve();
                        });
                });

            }
            resolve(`CMDS_FINISHED`);
        });
    }

    async folderStructure(): Promise<any> {
        try {
            let rootFiles = this.project["root"];
            let fileIndex = 0;

            if (!rootFiles.length) {
                _.say('No root files to include in generation, moving on...', 'yellow');
            }
            else {
                _.say(`Found ${rootFiles.length} root files to map...`);

                await this.rootFilesCreation(rootFiles, fileIndex);

                _.say('Root files have been created, creating recursion tree to create other nested files and folders...');
                await this.recursiveStrategyCreation(Object.keys(this.project), this.project);
            }
        } catch (e) {
            throw e;
        }
    }

    async rootFilesCreation(rootFiles: string[], fileIndex: number) {
        let filesContentMap = {};

        for (let file of rootFiles) {
            if (!await this.checkTemplatesFolderForMatchingFile(file)) {
                throw new Error(`FILE_NOT_FOUND_${fileIndex}`);
            }
            filesContentMap[file] = true;
            fileIndex++;
        }
        if (fileIndex === rootFiles.length) {
            _.say('All files are mapped. Proceeding to creation.');
        }

        _.say(`Reading files content now...`);

        for (let file of rootFiles) {
            _.say(`Reading ${this.templateDir}/${file}...`);
            let read = await Files.read(this.templateDir + `/${file}`);
            filesContentMap[file] = read;
        }

        for (let file of rootFiles) {
            _.say(`Touching file ${file}...`);
            let buffer = filesContentMap[file];
            await Files.touch(this.completeTarget, file, buffer);
        }

    }

    async recursiveStrategyCreation(data: string[], content: any): Promise<any> {
        for (let each of data) {
            if (each !== 'root' && each !== 'projectName' && each !== 'commands') {
                if (Array.isArray(content[each])) {
                    _.say(`Creating folder ${each}...`);
                    await Files.createDir(this.completeTarget + `/${each}`);
                    for (let subitem of content[each]) {
                        if (typeof subitem === "string") {
                            _.say(`Reading from file ${subitem}...`);
                            let buffer = await Files.read(this.templateDir + `/${subitem}`);
                            _.say(`Writing on ${this.completeTarget}/${each}`);
                            await Files.touch(this.completeTarget + `/${each}`, subitem, buffer);
                        }
                        else if (typeof subitem === "object") {
                            this.recursiveStrategyCreation(Object.keys(subitem), subitem);
                        }
                    }
                }
            }
        }
    }

    async checkTemplatesFolderForMatchingFile(fileName: string): Promise<boolean> {
        let fileList = await Files.readDir(this.templateDir);
        const find = fileList.find(k => k === fileName);
        return !!find;
    }
}