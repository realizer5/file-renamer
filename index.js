#!/usr/bin/env node
import { Command } from 'commander';
import { promises as fs } from 'node:fs';
import path from "node:path";
import inquirer from 'inquirer';
import chalk from 'chalk';
const program = new Command();

program
    .name('renamer')
    .description('CLI tool to rename files')
    .version('1.0.0');


program
    .argument('<Folder_Path>')
    .option('-r <name>', 'name to replace')
    .option('-w <name>', 'name to replace with')
    .option('-file', 'replace only file names')
    .option('-folder', 'replace only folder names')
    .action(async (Folder_Path, options) => {
        try {
            const data = await fs.readdir(Folder_Path);
            if (!options.File && !options.Folder) {
                options.File = true;
                options.Folder = true;
            }
            const newData = await renameFiles(data, Folder_Path, options);
            const fileNames = await findDifferences(newData.files, newData.newFiles);
            const folderNames = await findDifferences(newData.folders, newData.newFolders);
            if (fileNames.newNames.length === 0 && folderNames.newNames.length === 0) {
                return console.info(chalk.yellow('no match found of given name'));
            }
            let fileLength = false;
            let folderLength = false;
            if (fileNames.newNames.length > 0) {
                fileLength = true;
            }
            if (folderNames.newNames.length > 0) {
                folderLength = true;
            }
            const answer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `These names will be changed from ${fileLength ? chalk.blue(chalk.italic('Files: ') + fileNames.oldNames) : ''} ${folderLength ? chalk.magenta(chalk.italic("Folders: ") + folderNames.oldNames) : ''} to ${fileLength ? chalk.blue(chalk.italic('Files: ') + fileNames.newNames) : ''} ${folderLength ? chalk.magenta(chalk.italic('Folders: ') + folderNames.newNames) : ''}`,
                    default: true
                }
            ]);
            if (answer.confirm) {
                if (options.File) {
                    for (const item in newData.files) {
                        if (newData.files.hasOwnProperty(item)) {
                            const oldPath = path.join(Folder_Path, newData.files[item]);
                            const newPath = path.join(Folder_Path, newData.newFiles[item]);
                            fs.rename(oldPath, newPath);
                        }
                    }
                }
                if (options.Folder) {
                    for (const item in newData.folders) {
                        if (newData.folders.hasOwnProperty(item)) {
                            const oldPath = path.join(Folder_Path, newData.folders[item]);
                            const newPath = path.join(Folder_Path, newData.newFolders[item]);
                            fs.rename(oldPath, newPath);
                        }
                    }
                }
                console.log(chalk.green('Renaming Successfull'));
            } else {
                console.log(chalk.yellow('Renaming is canceled'));
            }
        } catch (err) {
            console.error(chalk.bold.red('Invalid Path'), err);

        }

    });

async function separateFilesAndFolders(data, Folder_Path) {
    const files = [];
    const folders = [];

    try {
        for (const item of data) {
            const fullPath = path.join(Folder_Path, item);
            const stats = await fs.lstat(fullPath);  // Get stats for each item

            if (stats.isDirectory()) {
                folders.push(item);
            } else if (stats.isFile()) {
                files.push(item);
            }
        }

        return { files, folders };
    } catch (error) {
        console.error(chalk.bold.red('Error seperating files and folders'), error);
    }
}
async function renameFiles(data, Folder_Path, options) {
    try {
        const filesFolders = await separateFilesAndFolders(data, Folder_Path);
        const files = filesFolders.files;
        let newFiles = [];
        let newFolders = [];
        const folders = filesFolders.folders;
        const replaceName = options.r;
        const replaceNameWith = options.w;
        if (options.File) {
            files.forEach(item => {
                newFiles.push(item.replaceAll(replaceName, replaceNameWith));
            });
        }
        if (options.Folder) {
            folders.forEach(item => {
                newFolders.push(item.replaceAll(replaceName, replaceNameWith));
            });
        }
        return { files, folders, newFiles, newFolders }
    } catch (err) {
        console.error(chalk.bold.red("error renaming data"), err)
    }
}
async function findDifferences(arr1, arr2) {
    try {
        const oldNames = arr1.filter(item => !arr2.includes(item));
        const newNames = arr2.filter(item => !arr1.includes(item));
        return { oldNames, newNames };
    } catch (err) {
        console.error(chalk.bold.red('error finding diffrence in names'), err);
    }
}
program.parse();
