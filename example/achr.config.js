'use strict';
module.exports = function(utils, dir) { // dir is script directory, __dirname is this directory
  const path = require('path');
  const u = utils;
  const cheerio = u.libs.cheerio;
  const _ = u.libs.lodash;

  const graphdb = u.graphdb(path.join(__dirname, 'db'));

  const crawler = {
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

  const crawl = {
    domain: "achr.net",
    defrost: path.join(__dirname, 'freezer', 'achr.net') + '.json',
    freeze: path.join(__dirname, 'freezer', 'achr.net')+'.json', 
    crawler,
    on: {
      "fetchcomplete": function(queueItem, data, res) {
        var waiting = this.wait();
        var $ = cheerio.load(data);

        // Do stuff
        var external = u.links($(u.select.e(queueItem.host)), $);
        var internal = u.links($(u.select.i(queueItem.host)), $);

        graphdb.put(_.map(external, (value, key) => ({
          subject: queueItem.url,
          predicate: "external",
          object: value
        })));

        graphdb.put(_.map(internal, (value, key) => ({
          subject: queueItem.url,
          predicate: "internal",
          object: value || '#' //TODO: maybe change to object: queueItem.host + value
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
    },
    fetchConditions: {
      "domainBlacklist": function(parsedURL, queueItem) {
        return !crawler.domainBlacklist.some((bad) => u.noSub(parsedURL.host) === bad);
      },
      "maxSiteDepth": function(parsedURL, queueItem) {
        return parsedURL.path.split(/\/|\?|\&/).length < crawler.maxSiteDepth;
      },
      "fetchIgnoreRegex": function(parsedURL, queueItem) {
        return !parsedURL.path.match(crawler.fetchIgnoreRegex);
      }
    }
  };

  const viz = {
    port: 3003,
    publicDir: path.join(__dirname, 'public'),
    libs: [
      "./public/cytoscape.min.js"
    ],
    data: (function(callback) { // Executes in node scope, callback returns in page scope in "data" variable
      graphdb.get({}, function(err, list) {
        /*
        { 
          data: {
            id: 'e1',
            source: 'n1',
            target: 'n2'
          } 
        }
        */
        var edges = _.map(list, (n) => {
          return {
            classes: n.predicate,
            group: 'edges',
            data: {
              source: n.subject,
              target: n.object,
              id: `${n.object}_from_${n.subject}`
            }
          };
        });
        var nodes = [];
        _.forEach(list, (n) => {
          nodes.push({
            group: 'nodes',
            data: {
              id: n.object
            }
          });
          nodes.push({
            group: 'nodes',
            data: {
              id: n.subject
            }
          });
        });
        var data = _.concat(_.uniq(nodes), edges);

        callback(err, data);
      });
    }),
    script: function(cytoscape, data) { // Executes in page scope
      /*global document*/
      cytoscape({
        container: document.getElementById('cy'),
        elements: data,
        style: [{
          selector: 'node',
          style: {
            'background-color': 'red',
            'label': 'data(id)'
          }
        }, {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }, {
          selector: 'edge.external',
          style: {
            'width': 3,
            'line-color': 'blue',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }],
        layout: {
          name: 'cose',
          idealEdgeLength: 100,
          nodeOverlap: 20
        }
      });
      console.log("Here's the data: ", data);
    }
  };


  return {viz, crawl};
};
