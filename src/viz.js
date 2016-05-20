'use strict';
const u = require('./utils');
const _ = require('lodash');
const express = require('express');
const defaultConfig = require('./config.js');

module.exports = class Viz {
  
  constructor(configPath) {
    this.configPath = configPath;
    this.config = _.merge(defaultConfig, require(this.configPath)(u, __dirname)).viz;
    this.app = express();
  }
  
  start() {
    let port = this.config.port;
    this.initRoutes();
    this.server = this.app.listen(port, console.log("Visualization server started on port %s", port));
  }
  
  restart() {
    delete require.cache[this.configPath];
    this.config = _.merge(defaultConfig, require(this.configPath)(u, __dirname)).viz;
    this.server.close();
    this.start();
    
  }
  
  initRoutes() {
    let styles = this.config.styles.map((c) => `<link type="text/css" rel="stylesheet" src="${c}"/>`).join('\n');
    let libs = this.config.libs.map((c) => `<script type="text/javascript" src="${c}"></script>`).join('\n');
    let page = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Viz</title>
          <style> body, #cy { height: 100vh; width: 100vw; margin: 0; padding: 0;} </style>
          ${styles}
        </head>
        <body>
          <div id="viz"></div>
        </body>
        ${libs}
        <script type="text/javascript" src="./data.js"> </script>
        <script type="text/javascript">
          document.addEventListener("DOMContentLoaded", function(event) { 
            (${this.config.script})(cytoscape, data)
          });
        </script>
      </html>
      `;
    
    this.app.use('/public/', express.static(this.config.publicDir));
    
    this.app.get('/data.js', function (req, res) {
      res.set('Content-Type', 'text/javascript');
      this.config.data(function(err, data){
        if (err) {console.log(err);}
        
        res.send(`var data = ${JSON.stringify(data)}`);
      });
    });

    this.app.get('/', function (req, res) {
      console.log("Loading index");
      res.send(page);
    });
  }
};
