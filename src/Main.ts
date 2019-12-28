import Files from "./tools/Files";
import _ from "./tools/Terminal";
import metadata from "../template.json";
import { Question, Checkbox } from "./tools/Header";


export default class Main {

    target: string;
    project: any;
    constructor() {
        this.target = "";
        this.project = "";
    }

    async run() {
        this.project = await this.select();
        this.target = __dirname;
        if (await Files.isDir(this.target + `/${this.project.projectName}`)) {
            _.say(`There is already a folder named ${this.project.projectName} on ${this.target}.`, 'red');
            process.exit(1);
        }
        
        await Files.createDir(this.target + `/${this.project.projectName}`);
        
        // this.project = metadata.templates
        // let fileListTarget = await Files.readDir(this.target);
        // let templates = await Files.readDir('./src/templates');
        // // console.log(templates, metada.templates);
        // console.log(fileListTarget);

    }

    async select() {
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
}