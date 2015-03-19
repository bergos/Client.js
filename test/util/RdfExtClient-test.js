var RdfExtClient = require('../../lib/util/RdfExtClient');

var Iterator = require('../../lib/iterators/Iterator'),
    rdf = require('../../lib/util/RdfUtil'),
    rdfExt = require('rdf-interfaces'),
    fs = require('fs');

require('rdf-ext')(rdfExt);

describe('RdfExtClient', function () {
  describe('The RdfExtClient module', function () {
    it('should be a function', function () {
      RdfExtClient.should.be.a('function');
    });

    it('should make RdfExtClient objects', function () {
      RdfExtClient().should.be.an.instanceof(RdfExtClient);
    });

    it('should be a RdfExtClient constructor', function () {
      new RdfExtClient().should.be.an.instanceof(RdfExtClient);
    });
  });

  describe('A RdfExtClient with a store and options', function () {
    var store;
    var options = {defaultGraphIri: null};

    // Creates a store from the given file
    function fromFile(filename, done) {
      rdfExt.parseTurtle(fs.readFileSync(filename).toString(), function (graph) {
        store = new rdfExt.InMemoryStore();

        store.add(options.defaultGraphIri, graph, function () {
          done();
        });
      });
    }

    // Creates a quad object from the components
    function quad(graph, subject, predicate, object) {
      return { graph: graph, subject: subject, predicate: predicate, object: object };
    }

    describe('when asked for ?s dbpedia-owl:birthPlace dbpedia:York', function () {
      var pattern = quad(options.defaultGraphIri, '?s', rdf.DBPEDIAOWL + 'birthPlace', rdf.DBPEDIA + 'York');

      describe('and receiving a Turtle response', function () {
        var client;
        var result;

        it('???', function (done) {
          fromFile(__dirname + '/../data/fragments/$-birthplace-york.ttl', function () {
            client = new RdfExtClient(store, options);
            result = client.getFragmentByPattern(pattern);

            done();
          });
        });

        it('should stream the data triples in the fragment', function (done) {
          result.should.be.a.iteratorWithLength(10, done);
        });
      });
    });
  });
});
