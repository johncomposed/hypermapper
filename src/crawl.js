'use strict';
const Crawler = require('simplecrawler').Crawler;
const _ = require('lodash');
const u = require('./utils');
const defaultConfig = require('./config.js');


module.exports = class Crawl {
  
  constructor(configPath) {
    const config = this.config = _.merge(defaultConfig, require(configPath)(u, __dirname)).crawl;
    const crawler = this.crawler = new Crawler(config.domain);

    // Defrost if set
    if (config.defrost) { crawler.queue.defrost(config.defrost); }

    // Set crawler config
    _.merge(crawler, config.crawler);

    // Set onConfig
    _.forEach(config.on, (value, key) => crawler.on(key, value));
    
    // Custom fetch conditions
    _.forEach(config.fetchConditions, (value, key) => crawler.addFetchCondition(value));

    // Callback on complete
    crawler.on("complete", () => console.log("Complete crawling %s!", config.domain));
    
    // Freeze before kill
    if (config.freeze) {
      process.on("SIGINT", () => crawler.queue.freeze(config.freeze, function() {
        console.log("Frozen queue to %s", config.freeze);
        process.exit();
      }));
    }
  }

  start() {
    console.log(this.config);
    this.crawler.start();
  }
  
  getCrawler() {
    return this.crawler;
  }
};
