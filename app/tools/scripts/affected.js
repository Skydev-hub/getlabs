const process = require('process');

const { __rootdir__ } = require('../../root');
const { execSync } = require('child_process');

// Change dir back to root so we can run this script from anywhere
process.chdir(__rootdir__);
const base = process.env.GITHUB_REF ? 'origin/master' : 'origin/master~1';
const head = process.env.GITHUB_REF ? process.env.GITHUB_REF : 'HEAD';
// console.log(JSON.stringify(execSync(`./node_modules/.bin/nx affected:apps --base=origin/master --plain`).toString().trim().split(' ').filter(Boolean).map(app => { return {app}; })));
// console.log(JSON.stringify(execSync(`./node_modules/.bin/nx affected:apps --base=${base} --head=${head} --plain`).toString().trim().split(' ').filter(Boolean).map(app => { return {app}; })));

// Just build both apps for now until I have time to figure out the proper usage of the above command
console.log(JSON.stringify(['app', 'web'].map(app => { return {app}; })));
