import Files from "./tools/Files";
import _ from "./tools/Terminal";
import metadata from "../template.json";
import { Question, Checkbox } from "./tools/Header";

// @TODO - Make the templates folder inside the main projectName folder. That is, everytime this sourcecode is compiled
// it will FIRST generate the projectName folder and a templates folder inside it. And thats where I should read the dirs from.
// This makes it easier for people to use, so that they won't have to look where this package has been installed.

export default class Main {

    target: string;
    completeTarget: string;
    project: any;
    cmds: string[];

    constructor() {
        this.target = "";
        this.completeTarget = ""
        this.project = "";
        this.cmds = [];
    }

    async run() {
        this.project = await this.select();
        this.target = __dirname;

        if (await Files.isDir(this.target + `/${this.project.projectName}`)) {
            _.say(`There is already a folder named ${this.project.projectName} on ${this.target}.`, 'red');
            process.exit(1);
        }

        await Files.createDir(this.target + `/${this.project.projectName}`);
        this.completeTarget = this.target + `/${this.project.projectName}`;

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
                const FILE_NOT_FOUND = metadata.templates[0]["root"][index];
                _.say(`File ${FILE_NOT_FOUND} was not found in the folder \'./templates\`.`, 'red');
                _.say(`Please make sure all files you want generated are included in the \'./templates\` folder of this project sourcecode.`, 'red')
                process.exit(1);
            }
            _.say((e || { message: e }), 'red');
        }

    }
    // @TODO - Tipefy the JSON template. 
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

            if (!metadata.commands.length) reject("NO_CMDS");

            for (let command of metadata.commands) {

                let thread = new Promise(async (resolve, reject) => {

                    let c = await require('child_process').execSync(command,
                        { cwd: this.completeTarget },
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
            let rootFiles = metadata.templates[0]["root"];
            let fileIndex = 0;

            if (!rootFiles.length) {
                _.say('No root files to include in generation, moving on...', 'yellow');
            }
            else {
                _.say(`Found ${rootFiles.length} root files to map...`);

                await this.rootFilesCreation(rootFiles, fileIndex);

                _.say('Root files have been created, creating recursion tree to create other nested files and folders...');
                await this.recursiveStrategyCreation(Object.keys(metadata.templates[0]), metadata.templates[0]);
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
            _.say(`Reading ${this.completeTarget}/${file}...`);
            let read = await Files.read(this.target + `/templates/${file}`);
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
            if (each !== 'root' && each !== 'projectName') {
                if (Array.isArray(content[each])) {
                    _.say(`Creating folder ${each}...`);
                    await Files.createDir(this.target + `/${this.project.projectName}/${each}`);
                    for (let subitem of content[each]) {
                        if (typeof subitem === "string") {
                            _.say(`Reading from file ${subitem}...`);
                            let buffer = await Files.read(this.target + `/templates/${subitem}`);
                            _.say(`Writing on ${this.target + "/" + this.project.projectName}/${each}`);
                            await Files.touch(this.target + `/${this.project.projectName}/${each}`, subitem, buffer);
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
        let fileList = await Files.readDir(this.target + '/templates');
        const find = fileList.find(k => k === fileName);
        return !!find;
    }
}