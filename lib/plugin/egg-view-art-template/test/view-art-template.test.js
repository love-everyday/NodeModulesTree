'use strict';

const mock = require('egg-mock');

describe('test/view-art-template.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/view-art-template-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, viewArtTemplate')
      .expect(200);
  });
});
