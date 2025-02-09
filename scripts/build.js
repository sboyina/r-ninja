const { spawn } = require('child_process');
const fs = require('fs');

const PROJECT_ROOT = `${__dirname}/..`;

const build = async () => {
    if (fs.existsSync(`${PROJECT_ROOT}/build`)) {
        fs.rmSync(`${PROJECT_ROOT}/build`, { recursive: true });
    }
    fs.mkdirSync(`${PROJECT_ROOT}/build`);
    await new Promise((resolve, reject) => {
        spawn('npx', ['tsc'], {
            cwd: PROJECT_ROOT,
            stdio: 'inherit'
        }).on('exit', resolve);
    });
    fs.copyFileSync(
        `${PROJECT_ROOT}/src/ninja.babel.plugin.js`, 
        `${PROJECT_ROOT}/build/ninja.babel.plugin.js`);
    fs.copyFileSync(
        `${PROJECT_ROOT}/package.json`, 
        `${PROJECT_ROOT}/build/package.json`);
    fs.copyFileSync(
        `${PROJECT_ROOT}/package-lock.json`, 
        `${PROJECT_ROOT}/build/package-lock.json`);
    fs.copyFileSync(
        `${PROJECT_ROOT}/readme.md`, 
        `${PROJECT_ROOT}/build/readme.md`);
};

build();