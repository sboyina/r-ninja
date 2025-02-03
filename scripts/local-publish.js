const { spawn } = require('child_process');
const fs = require('fs');

const PROJECT_ROOT = `${__dirname}/..`;

const publish = async () => {
    await new Promise((resolve, reject) => {
        spawn('npx', ['yalc', 'publish'], {
            cwd: `${PROJECT_ROOT}/build`,
            stdio: 'inherit'
        }).on('exit', resolve);
    });
};

publish();