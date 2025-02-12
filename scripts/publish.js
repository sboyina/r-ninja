const { spawn } = require('child_process');

const BUILD_DIR = `${__dirname}/../build`;

async function publish() {
    await new Promise((resolve, reject) => {
        spawn('npm', ['publish'], {
            cwd: BUILD_DIR,
            stdio: 'inherit'
        }).on('exit', resolve);
    });
}

publish();