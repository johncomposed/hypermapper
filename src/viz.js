'use strict';
const u = require('./utils');
const _ = require('lodash');
const express = require('express');
const c = require('./config.js');

module.exports = class Viz {
  
  constructor(configPath) {
    this.configPath = configPath;
    this.config = c(require(this.configPath)(u, __dirname)).viz;

    this.app = express();
  }
  
  start() {
    let port = this.config.port;
    this.initRoutes();
    this.server = this.app.listen(port, console.log("Visualization server started on port %s", port));
  }
  
  restart() {
    delete require.cache[this.configPath];
    this.config = c(require(this.configPath)(u, __dirname)).viz;
    this.server.close();
    this.start();
    
  }
  
  
  initRoutes() {
    // Custom express functions
    this.config.customFunctions.map((f) => f(this.app, express));
    
    // Make public directory under /public
    this.app.use('/public/', express.static(this.config.publicDir));
    
    // Api calls
    this.app.get('/api/:key', function (req, res) {
      var value = this.config.api[req.params.key];
      
      if (_.isFunction(value)) {
        value(function(err, data){
          if (err) {console.log(err);}
          res.send(JSON.stringify(data));
        });
      } else {
        res.send(JSON.stringify(value));
      }
    });
    
    
    // Setting up styles and scripts
    var styles = this.config.styles.map((c) => `<link type="text/css" rel="stylesheet" src="${c}"/>`).join('\n');
    var scripts = this.config.scripts.map((c) => _.isFunction(c) ? `<script type="text/javascript">(${c})()</script>` : `<script type="text/javascript" src="${c}"></script>`).join('\n');


    // Setup index
    this.app.get('/', (req, res) => {
      console.log("Loading index");
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Viz</title>
            <style> body, #viz { height: 100vh; width: 100vw; margin: 0; padding: 0;} </style>
            ${styles}
          </head>
          <body>
            <div id="viz"></div>
          </body>
          ${scripts}
        </html>
      `);
    });
  }
};
