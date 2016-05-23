'use strict';
const _ = require('lodash');
const u = require('./utils');
const path = require('path');
require('coffee-script/register');

const defaultConfig = {
  crawl: {
    crawler: {
      timeout: 80000
    },
    on: {
      "crawlstart": () => console.log("Started crawler!"),
      "complete": () => console.log("Crawling complete!")
    },
    fetchConditions: {}
  },
  viz: {
    port: 3000,
    styles: [],
    scripts: [],
    customFunctions: [],
    visjs: require.resolve('vis')
  }
};

module.exports = class Config {
  constructor(configPath) {
    this.configPath = configPath;
    this.init();
  }
  
  init() {
    var userConfig = require(this.configPath)(u, __dirname);
    var config = _.merge(defaultConfig, userConfig);
    
    // Set custom crawler options
    if (config.crawl.crawler.onlyHypertext) {
      config.crawl.crawler.supportedMimeTypes = [/^text\/html/i];
      config.crawl.crawler.downloadUnsupported = false;
      config.crawl.crawler.fetchIgnoreRegex = /\.(pdf|css|js|gif|jpg|jpeg|png)$/i;
    }
    if (config.crawl.crawler.onlyVisible) {
      config.crawl.crawler.parseHTMLComments = false;
      config.crawl.crawler.parseScriptTags = false;
    }
    if (config.crawl.crawler.followExternal) {
      config.crawl.crawler.allowInitialDomainChange = true;
      config.crawl.crawler.filterByDomain = false;
      config.crawl.crawler.scanSubdomains = true;
    }
    if (config.crawl.crawler.fetchIgnoreRegex) {
      config.crawl.fetchConditions.fetchIgnoreRegex = function(parsedURL, queueItem) {
        return !parsedURL.path.match(config.crawl.crawler.fetchIgnoreRegex);
      };
    }
    if (config.crawl.crawler.domainBlacklist) {
      config.crawl.fetchConditions.domainBlacklist = function(parsedURL, queueItem) {
        return !config.crawl.crawler.domainBlacklist.some((bad) => u.noSub(parsedURL.host) === bad);
      };
    }
    
    // Set custom viz option
    if (config.viz.visjs) {
      let name = `/${path.basename(config.viz.visjs)}`;
      config.viz.customFunctions.unshift((app, express) => {
        app.use(name, express.static(config.viz.visjs));
      });
      config.viz.scripts.unshift(name); 
    }
    
    this.config = config;
    this.crawl = config.crawl;
    this.viz = config.viz;
  }

  reload() {
    this.config = undefined;
    this.crawl = undefined;
    this.viz = undefined;
    delete require.cache[this.configPath];

    this.init();
  }
  
};
