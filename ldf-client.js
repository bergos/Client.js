/*! @license ©2013 Ruben Verborgh - Multimedia Lab / iMinds / Ghent University */
/** Main ldf-client module exports. */
var xmlWriter = require('./lib/writers/SparqlXMLResultWriter');
var jsonWriter = require('./lib/writers/JSONResultWriter');
var rdfiWriter = require('./lib/writers/RdfInterfacesWriter');
var sparqlJsonWriter =require('./lib/writers/SparqlJSONResultWriter');
var SparqlResultWriter = require('./lib/writers/SparqlResultWriter');

SparqlResultWriter.register('application/json', jsonWriter);
SparqlResultWriter.register('application/sparql-results+json', sparqlJsonWriter);
SparqlResultWriter.register('application/sparql-results+xml', xmlWriter);
SparqlResultWriter.register('application/rdf-interfaces', rdfiWriter);

module.exports = {
  SparqlIterator: require('./lib/triple-pattern-fragments/SparqlIterator.js'),
  FragmentsClient: require('./lib/triple-pattern-fragments/FragmentsClient'),
  Logger: require('./lib/util/Logger'),
  SparqlResultWriter: SparqlResultWriter,
  RdfExtClient: require('./lib/util/RdfExtClient'),
  QueryEngine: require('./lib/util/RdfExtQueryEngine')
};
if (typeof window !== 'undefined') {
  window.rdfQueryEngine = module.exports;
}

