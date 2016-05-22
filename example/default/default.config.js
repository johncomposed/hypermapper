'use strict';
/*
A basic example

For details about this file, wait until the v1 release!


*/
module.exports = function(utils, dir) {
  return {
    crawl: {
      crawler: {},
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
      visjs: require.resolve(dir'/node_modules/vis')
    }
  }
};
