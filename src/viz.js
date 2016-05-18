'use strict';

const Viz = module.exports = function(config, viz_callback) {
  const u = require('./utils');
  const _ = require('lodash');
  const express = require('express');
  const port = config.port;
  
  const app = express();
  
  const libScripts = config.libs.map((c) => `<script type="text/javascript" src="${c}"></script>`).join('\n');
  const page = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>cytoscape</title>
      ${libScripts}
      <script type="text/javascript" src="./data.js"> </script>
      <script type="text/javascript">
        document.addEventListener("DOMContentLoaded", function(event) { 
          (${config.script})(cytoscape, data)
        });
      </script>
      <style>
      body, #cy {
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
      }
      </style>
    </head>
    <body>
      <div id="cy"></div>
    </body>

  </html>
  `;

  app.use('/public/', express.static(config.publicDir));
  
  app.get('/', function (req, res) {
    console.log("Loading index");
    res.send(page);
  });

  app.get('/data.js', function (req, res) {
    res.set('Content-Type', 'text/javascript');
    config.data(function(err, data){
      if (err) {console.log(err);}
      
      res.send(`var data = ${JSON.stringify(data)}`);
    });
  });

  app.listen(port);
  viz_callback(port);
};
