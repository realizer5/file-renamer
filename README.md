### File Renamer
 File Renamer CLI tool made with node js

node module used :
* commander
* inquirer
* chalk

## Installation

 clone this repository with:
```bash
 git clone https://github.com/realizer5/file-renamer/
```
install packages in file-renamer with :
```bash
 npm i
```
To link it locally:
```bash
 npm link
```
This command creates a symbolic link to your CLI tool, allowing you to run `renamer` from anywhere on your system.

or just use it using it's path with node js
## Usage

Example:
```bash
 renamer [path] -r 'name to replace' -w 'name to replace with' -file or -folder
```
command options:
* path to folder - example/folder
* -r - name to replace
* -w - name to replace with
* -file or -folder - to change only file names or only folder names
* don't use any flags to rename file and folders both
