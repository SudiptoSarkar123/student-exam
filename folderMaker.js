const fs = require('fs');
const path = require('path');

const app = 'app'
const foldersInApp = ['config', 'controller', 'helper','middleware', 'model','router'];
const foldersInRoot = ['upload','views','public'];

if (!fs.existsSync(app)) {
    fs.mkdirSync(app);    
}

foldersInRoot.forEach((folder)=>{
    const folderPath = path.join(folder)
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
    }
})

foldersInApp.forEach((folder) =>{
    const folderPath = path.join(app,folder)
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
    }
})