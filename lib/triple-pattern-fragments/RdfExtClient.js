var Iterator = require('../iterators/Iterator'),
    rdf = require('../util/RdfUtil');

function RdfExtClient(store, options) {
  if (!(this instanceof RdfExtClient))
    return new RdfExtClient(store, options);

  this._store = store;
  this._options = options;
}

// Returns the Store Iterator for the given triple pattern
RdfExtClient.prototype.getFragmentByPattern = function (pattern) {
  // Replace all variables and blanks in the pattern by `null`
  var graph     = this._options.defaultGraphIri;
  var subject   = rdf.isVariableOrBlank(pattern.subject)   ? null : pattern.subject;
  var predicate = rdf.isVariableOrBlank(pattern.predicate) ? null : pattern.predicate;
  var object    = rdf.isVariableOrBlank(pattern.object)    ? null : pattern.object;

  return new StoreIterator(this._store, {
    graph: graph,
    subject: subject,
    predicate: predicate,
    object: object
  });
};

// Converts a RDF-Interfaces Node to N3.js format
function convertNode(node) {
  if (node.interfaceName === 'Literal') {
    return '"' + node.toString() + '"';
  } else {
    return node.toString();
  }
}

// Converts a RDF-Interfaces Triple to N3.js format
function convertTriple(graph, triple) {
  return {
    graph: graph,
    subject: convertNode(triple.subject),
    predicate: convertNode(triple.predicate),
    object: convertNode(triple.object)
  };
}

// Creates a new Store Iterator
function StoreIterator(store, pattern) {
  if (!(this instanceof StoreIterator))
    return new StoreIterator(store, pattern);
  Iterator.call(this);

  var self = this;

  store.match(pattern.graph, pattern.subject, pattern.predicate, pattern.object, function (graph) {
    self._matches = graph.toArray().map(function (triple) {
      return convertTriple(pattern.graph, triple);
    });

    self.emit('readable');
  });
}
Iterator.inherits(StoreIterator);


// Reads data from the Store matches
StoreIterator.prototype._read = function () {
  if (this._matches) {
    var item = this._matches.shift();

    if (item !== undefined) {
      this._push(item);
    } else {
      this._end();
    }
  }
};

module.exports = RdfExtClient;
