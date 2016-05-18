'use strict';
const help = [
  "Example usage: ./bin/hypermapper cmd config.js", 
  "Where cmd is [crawl] or [viz] and config is your config file",
  "Note you can also run ./bin/hypermapper-dev for auto-reloading on save"
].join('\n');

if (process.argv.slice(3).length < 1) {
  console.log(process.argv);
  console.error(help);
  process.exit();
}
const Utils = require('./utils.js');
const Crawl = require('./crawl.js');
const Viz = require('./viz.js');
const DefaultConfig = {}; //TODO

const resolve = require('resolve');
const assignIn = require('lodash').assignIn;

const cmd = process.argv[2];
const configArg = process.argv[3];
const configFile = resolve.sync('./' + configArg, { basedir: process.cwd() });
const configFun = require(configFile);

const config = assignIn(DefaultConfig, configFun(Utils, __dirname));


if(cmd === 'crawl') {
  Crawl(config.crawl, (domain) => {
    console.log("Completed crawling %s!", domain);
  });

} else if (cmd === 'viz') {
  Viz(config.viz, (port) => {
    console.log("Visualization server started on port %s", port);
  });

} else {
  console.log("Command %s not found", cmd);
  console.log(help);
}
 
