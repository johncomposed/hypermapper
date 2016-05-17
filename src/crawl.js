'use strict';

const Crawler = require('simplecrawler').Crawler;
const _ = require('lodash');
const config = require('./config.js');


module.exports = function(domain, freezer, crawl_callback) {
  const myCrawler = exports.crawler = new Crawler(domain);

  // Optional defrost
  if (freezer) { myCrawler.queue.defrost(freezer); }

  // Set crawler config
  _.assign(myCrawler, config.crawler);

  // Set onConfig
  _.forEach(config.on, (value, key) => myCrawler.on(key, value));
  
  // Custom fetch conditions
  _.forEach(config.fetchConditions, (value, key) => myCrawler.addFetchCondition(value));
  

  // TODO: Send some info in the callback
  myCrawler.on("complete", () => crawl_callback());


  // Start Crawl
  myCrawler.start();


  // Graceful shutdown
  process.on("SIGINT", function() {
    let freezer = meta.freezer || `./${config.meta.dataDirectory}/frozen_queue_${Date.now()}.json`;
    
    myCrawler.queue.freeze(freezer, function() {
      console.log("Frozen queue to %s", freezer);
      process.exit();
    });
  });
  
  
  
  
  
};
