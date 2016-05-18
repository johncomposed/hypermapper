'use strict';

module.exports = function(config, crawl_callback) {
  const Crawler = require('simplecrawler').Crawler;
  const _ = require('lodash');
  
  const myCrawler = new Crawler(config.domain);

  // Defrost if set
  if (config.defrost) { myCrawler.queue.defrost(config.defrost); }

  // Set crawler config
  _.assign(myCrawler, config.crawler);

  // Set onConfig
  _.forEach(config.on, (value, key) => myCrawler.on(key, value));
  
  // Custom fetch conditions
  _.forEach(config.fetchConditions, (value, key) => myCrawler.addFetchCondition(value));
  
  // Callback on complete
  myCrawler.on("complete", () => crawl_callback(config.domain));


  // Start Crawl
  myCrawler.start();


  // Freeze before kill
  if (config.freeze) {
    process.on("SIGINT", function() {
      myCrawler.queue.freeze(config.freeze, function() {
        console.log("Frozen queue to %s", config.freeze);
        process.exit();
      });
    });
  }
  
  
  
  
  
  
};
