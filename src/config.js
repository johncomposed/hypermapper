'use strict';
const _ = require('lodash');
const u = require('./utils.js');

const cheerio = require('cheerio');
const levelup = require('level');
const levelgraph = require("levelgraph");
const sublevel = require("level-sublevel");

const meta = exports.meta = {
  dataDirectory: 'tmp'
};

const db = sublevel(levelup(`./${meta.dataDirectory}/db`));
const graph = levelgraph(db.sublevel('graph'));

const crawler = exports.crawler = {
  interval: 250,
  maxConcurrency: 40,
  supportedMimeTypes: [/^text\/html/i],
  downloadUnsupported: false,
  timeout: 80000,
  parseScriptTags: false,
  parseHTMLComments: false,
  maxDepth: 5,
  allowInitialDomainChange: true,
  filterByDomain: false,
  scanSubdomains: true, 
  // Custom fetch conditions config
  domainBlacklist: u.alexa500,
  maxSiteDepth: 3,
  fetchIgnoreRegex: /\.(pdf|css|js|gif|jpg|jpeg|png)$/i
};


const on = exports.on = {
  "fetchcomplete": function(queueItem, data, res) {
    var waiting = this.wait();
    var $ = cheerio.load(data);
    
    // Do stuff
    var external = u.links($(u.select.e(queueItem.host)), $);
    var internal = u.links($(u.select.i(queueItem.host)), $);

    graph.put(_.map(external, (value, key) => ({ 
      subject: queueItem.url, 
      predicate: "external", 
      object: value 
    })));
    
    graph.put(_.map(internal, (value, key) => ({ 
      subject: queueItem.url, 
      predicate: "internal",
      object: value //TODO: maybe change to object: queueItem.host + value 
    })));
    
    // Done
    console.log("Crawled %s", queueItem.url);
    waiting();
  },
  // "fetcherror": updateBroken,
  // "fetchtimeout": updateBroken,
  "crawlstart": () => {
    console.log("Started crawler!");
  }
};

const fetchConditions = exports.fetchConditions = {
  "domainBlacklist": function (parsedURL, queueItem) {
    return !crawler.domainBlacklist.some((bad) => u.noSub(parsedURL.host) === bad);
  },
  "maxSiteDepth": function(parsedURL, queueItem) {
    return parsedURL.path.split(/\/|\?|\&/).length < crawler.maxSiteDepth;
  },
  "fetchIgnoreRegex": function(parsedURL, queueItem) {
    return !parsedURL.path.match(crawler.fetchIgnoreRegex);
  }
  
};


// const updateBroken = function(queueItem) {
//   var search = graph.get({object: queueItem.url});
//   
//   _.forEach(search, (triple) => {
//     graph.del(triple, () => {
//       triple.status = 'broken';
//       graph.put(triple);
//     });
//   });
// };
