'use strict';
module.exports = function(utils, dir) {
  
  return {
    crawl: {
      crawler: {},
      on: {
        "customCrawlerOptions": function() {
          var crawler = this.crawler || this;
          if (crawler.onlyHypertext) {
            crawler.supportedMimeTypes = [/^text\/html/i];
            crawler.downloadUnsupported = false;
            crawler.fetchIgnoreRegex = /\.(pdf|css|js|gif|jpg|jpeg|png)$/i;
          }
          if (crawler.onlyVisible) {
            crawler.parseHTMLComments = false;
            crawler.parseScriptTags = false;
          }
          if (crawler.followExternal && crawler.domainBlacklist) {
            crawler.allowInitialDomainChange = true;
            crawler.filterByDomain = false;
            crawler.scanSubdomains = true;
          }
        },
        "domainBlacklist": function(parsedURL, queueItem) {
          var crawler = this.crawler || this;
          if (crawler.domainBlacklist) {
            return !crawler.domainBlacklist.some((bad) => utils.noSub(parsedURL.host) === bad);
          }
        },
        "fetchIgnoreRegex": function(parsedURL, queueItem) {
          var crawler = this.crawler || this;
          if (crawler.fetchIgnoreRegex) {
            return !parsedURL.path.match(crawler.fetchIgnoreRegex);
          }
        }
      },
      fetchConditions: {}
    },
    viz: {
      styles: [],
      libs: []
    }
  };
}(require('./utils'), __dirname);
