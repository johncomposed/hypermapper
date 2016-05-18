'use strict';
const repl = require('repl');
const lo = require('lodash');
const levelup = require('level');
const levelgraph = require("levelgraph");
const db = levelgraph(levelup("./db"));

const env = process.env.NODE_ENV || "dev";

// open the repl session
let replServer = repl.start({
  prompt: "hypermapper (" + env + ") > ",
});

replServer.context.lo = lo;
replServer.context.db = db;


// https://nodejs.org/api/repl.html#repl_replserver_definecommand_keyword_cmd
// replServer.context.epa = epa;
// db.get({ predicate: 'external', filter: (triple) => !lo.includes(triple.subject, 'achr.net')}, (err, results) => console.log(results.length));


/*
domainValid: function(host) {
  var initial =  exampleCrawler.prototype.domainValid(host);
  var blacklist = !u.alexa500.some((bad) => _.includes(host, bad));
  
  return initial && blacklist;
}
*/
