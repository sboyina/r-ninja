const { spawn } = require('child_process');
const fs = require('fs');

const PROJECT_ROOT = `${__dirname}/..`;

const build = async () => {
    fs.rmSync(`${PROJECT_ROOT}/build`, { recursive: true });
    fs.mkdirSync(`${PROJECT_ROOT}/build`);
    await new Promise((resolve, reject) => {
        spawn('npx', ['tsc'], {
            cwd: PROJECT_ROOT,
            stdio: 'inherit'
        }).on('exit', resolve);
    });
    fs.copyFileSync(
        `${PROJECT_ROOT}/src/watcher.babel.plugin.js`, 
        `${PROJECT_ROOT}/build/watcher.babel.plugin.js`);
    fs.copyFileSync(
        `${PROJECT_ROOT}/package.json`, 
        `${PROJECT_ROOT}/build/package.json`);
};

build();