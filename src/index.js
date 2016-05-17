'use strict';
if (process.argv.slice(2).length < 1) {
  console.error('Example usage: ./bin/hyperlinker startDomain.com freezer.json(optional)');
  process.exit();
}

const Crawl = require('./crawl.js');
const domain = process.argv[2];
const freezer = process.argv[3] || undefined;


// Go!
Crawl(domain, freezer, () => {
  console.log("Done with %s!", domain);
});
