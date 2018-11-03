/**
 * Jo Torsmyr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

/*global  module,console */
  /*jshint devel : true*/

'use strict';

module.exports = function(RED) {
  var luftkvalitet = require('../luftkvalitet.js');

  var DEBUG_PREFIX = '[luftkvalitet: lookup]';

  function Lookup(config) {
    RED.nodes.createNode(this, config);

    luftkvalitet.setDebugLogging(config.debug);

    var node = this;

    this.on('input', function(msg) {
      debugLog('node',  node);
      debugLog('config', config);

      msg.payload = msg.payload || {};

      var queryParameters = {
        metadata : msg.metadata || msg.payload.metadata || config.metadata,
        area : msg.area || msg.payload.area || config.area,
        parameter : msg.parameter || msg.payload.parameter || config.parameter,
      };

      debugLog(queryParameters);

      var parameters = luftkvalitet.getLookupQueryParameters(queryParameters);

       node.status({fill : 'green', shape : 'ring', text : 'Requesting lookup...'});
       luftkvalitet.luftkvalitetAPI('lookup', parameters)
       .then(function(response) {
         node.status({fill : 'green', shape : 'dot', text : 'Success'});
         console.info('lookup.js', 'luftkvalitetAPI response', response);
         msg.payload = response;
         node.send(msg);
       })
       .catch(function (error) {
         node.status({fill : 'red', shape : 'dot', text : 'Error ' + 
           (error.error ? error.error : error) });
         debugLog('Got error: ' + error);
         msg.payload = error;
         node.send(msg);
//           node.error(JSON.stringify(error), msg);
       });
    });

    function debugLog(...args) {
      console.debug(DEBUG_PREFIX, ...args);
    }

  }

  RED.nodes.registerType('luftkvalitet-lookup', Lookup);
};
