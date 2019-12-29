# CLI-maker

> My take on a CLI-maker to automate most of my stuff.

> typescript node.js fs cli oop

**Build status**

[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger)


***Graphics***

[![GRAPHIC1](https://i.imgur.com/0szvpa6.png)]()

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [License](#license)


## Installation

### Clone

- Clone this repository to your local machine using the following link `https://github.com/Brunodev09/CLI-maker`

### Setup and Execution

> You will need to install the contents of this project, and then install it globally to use this package like it was intended to.
> From the directory where this repo has been cloned, type:

```shell
$ npm i
```

> This will install the necessary dependencies of the project. Now you'll have to compile the Typescript files to vanilla Javascript files.
> Now you can either use Typescript to do it for you, if you have it installed on your OS.
```shell
$ tsc
```
> Or you can simply run it with:

```shell
$ npm run start
```

> Before you install this package globally, you should configure your templates. 
> This process has 2 steps:

- 1-) Open the file 'templates.json', there you will find an already done template as example. It will look like this:
```
{
    "templates": [
        {
            "projectName": "auto-backend",
            "root": [
                ".gitignore",
                "tsconfig.json",
                ".env"
            ],
            "src": [
                {
                    "controllers": [],
                    "tools": [],
                    "models": [],
                    "middlewares": [
                        "auth.ts"
                    ],
                    "interfaces": []
                },
                "Server.ts",
                "index.ts"
            ]
        }
    ],
    "commands": [
        "npm init -y", "npm install"
    ]
}
```
- Here, there are a few important properties, some are fixed in which you're not supposed to edit and others are custom.
- The fixed properties are: projectName, root and commands. These properties you should only edit its VALUES.

- projectName determines the name of your template.
- root is the property that holds the list of files that should be created at the root of your template (not inside any folder).
- commands is the property that holds the list of commands that are going to be executed in order.

- Now, the 'src' property is a custom property, and it represents a folder. Every array inside an object (tuple, {prop: []} in this JSON file represents a folder.
- If the property is NOT a tuple, then it must be a string, and strings represents files with their intended extensions.

- So that means my package will read this JSON and create the following folder/file tree:
```
 src (folder)
    controllers (empty folder)
    tools (empty folder)
    models (empty folder)
    middleware (folder)
        auth.ts (file)
    interfaces (empty folder)
 Server.ts (file)
 index.ts (file)
```
- So, to create a new structure, you can simply create a new object literal, inside the templates property, like this:

```
{
    "templates": [
        {
            "projectName": "auto-backend",
            "root": [
                ".gitignore",
                "tsconfig.json",
                ".env"
            ],
            "src": [
                {
                    "controllers": [],
                    "tools": [],
                    "models": [],
                    "middlewares": [
                        "auth.ts"
                    ],
                    "interfaces": []
                },
                "Server.ts",
                "index.ts"
            ]
        },
        {
          "projectName": "yourTemplate",
            "root": [
                "whateverFilesYouWantInRoot.extension"
            ],
            "yourFolder1": [
                {
                    "aSubFolder": ['file.extension', 'anotherfile.extension'],
                },
                "OneFile.extension"
            ]
        }
    ],
    "commands": [
        "npm init -y", "npm install"
    ]
}
```


- After that, you must make sure that EVERY FILE you mentioned in this JSON, is included inside the './templates' folder of this repo.
- So paste every file that you want cloned, INSIDE './templates' with the same name you included in your template.json file.

- Now all, you have to do is install the package globally. Install it with:
```shell
$ sudo npm install -g 
```

- Now, you can run this package from any directory, with the command 'bdv' and then 'start', and then the name of the folder you want created to store all the structure.
```shell
$ bdv
$ start
$ aNewFolder
```

> It's a little work on the first time, but saves tons of time whenever you want to start a new project or/and execute commands.

## Features
> A CLI interface that reads a structure from a JSON and a folder, to clone file/folder streams/structures and execute commands in a given directory.

## Technology

> Nodejs
> Typescript


## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
