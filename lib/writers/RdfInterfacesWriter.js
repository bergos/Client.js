/* Writer that serializes a SPARQL query result as a RDF-Interface Node object array or graph*/

var SparqlResultWriter = require('./SparqlResultWriter'),
    N3 = require('n3'),
    rdf = require('rdf-ext')();

function RdfInterfacesWriter(sparqlIterator) {
  SparqlResultWriter.call(this, true, sparqlIterator);

  switch (sparqlIterator.queryType) {
  case 'ASK':
  case 'SELECT':
    this.graph = [];
    break;

  case 'CONSTRUCT':
  case 'DESCRIBE':
    this.graph = rdf.createGraph();
    this.blankNodeMap = {};
    break;
  }
}
SparqlResultWriter.inherits(RdfInterfacesWriter);

RdfInterfacesWriter.prototype._writeHead = function (variableNames) {
  this.variableNames = variableNames;
};

RdfInterfacesWriter.prototype._transform = function (result, done) {
  var self = this;

  var createLiteral = function (node) {
    var
      value = N3.Util.getLiteralValue(node),
      language = N3.Util.getLiteralLanguage(node),
      type = N3.Util.getLiteralType(node);

    if (type !== null) {
      type = rdf.createNamedNode(type);
    }

    return rdf.createLiteral(value, language, type);
  };

  var createBlankNode = function (blankNode) {
    if (!(blankNode in self.blankNodeMap)) {
      self.blankNodeMap[blankNode] = rdf.createBlankNode();
    }

    return self.blankNodeMap[blankNode];
  };

  var createNode = function (node) {
    if (N3.Util.isLiteral(node)) {
      return createLiteral(node);
    } else if (N3.Util.isBlank(node)) {
      return createBlankNode();
    } else {
      return rdf.createNamedNode(node);
    }
  };

  var processRow = function () {
    return Object.keys(self.variableNames).reduce(function (row, variableKey) {
      var variable = self.variableNames[variableKey];

      row[variable] = createNode(result['?' + variable]);

      return row;
    }, {});
  };

  var processTriple = function () {
    return rdf.createTriple(
      createNode(result.subject),
      createNode(result.predicate),
      createNode(result.object));
  };

  if (Array.isArray(self.graph)) {
    self.graph.push(processRow());
  } else {
    self.graph.add(processTriple());
  }

  done();
};

RdfInterfacesWriter.prototype._end = function () {
  this._push(this.graph);

  SparqlResultWriter.prototype._end.call(this);
};

module.exports = RdfInterfacesWriter;
