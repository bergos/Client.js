/* global Promise */
var RdfExtClient = require('./RdfExtClient'),
    SparqlIterator = require('../triple-pattern-fragments/SparqlIterator.js'),
    SparqlResultWriter = require('../writers/SparqlResultWriter');


var QueryEngine = function (store, options) {
  options = options || {};

  options.format = options.format || 'application/rdf-interfaces';

  var config = {};

  config.fragmentsClient = new RdfExtClient(store, options);

  this.query = function (query) {
    return new Promise(function (resolve, reject) {
      try {
        var sparqlIterator = new SparqlIterator(query, config), writer;

        sparqlIterator.on('error', function (error) {
          reject(error);
        });


        if (options.format === 'application/rdf-interfaces') {
          // if rdf-interfaces was requested, return the data
          writer = new SparqlResultWriter(options.format, sparqlIterator);

          writer.on('data', function (data) {
            resolve(data);
          });
        } else {
          // return the writer for other formats
          resolve(new SparqlResultWriter(options.format, sparqlIterator));
        }
      } catch (error) {
        reject(error);
      }
    });
  };
};

module.exports = QueryEngine;
