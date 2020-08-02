const newman = require('newman');

newman.run({
  collection: require('./GFLAPITest.postman_collection.json'),
  reporters: 'cli',
});