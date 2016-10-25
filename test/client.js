import Mockingbird from '../src/client';
import rp from 'request-promise';
import { expect } from 'chai';

describe('Test mock', () => {
  let mock = null;

  before(() => {
    mock = new Mockingbird();
    return mock.start(); // Start Mockingbird server
  });

  after(() => {
    mock.stop(); // Stop Mock server
  });

  beforeEach(() => {
    return mock.get('/users/test', { hello: 'world' }).reply(200, {
      id: 'test-id',
      username: 'username',
    });
  });

  afterEach(() => {
    return mock.clean(); // Clean state after each test
  });

  it('should mock a user request', () => {
    const options = {
      method: 'GET',
      uri: `${mock.url}/users/test`,
      headers: {
        Accept: 'application/json',
      },
      json: true,
      resolveWithFullResponse: true,
      body: { hello: 'world' },
    };
    return rp(options).then((res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.body.id).to.equal('test-id');
      expect(res.body.username).to.equal('username');
    });
  });

  it('should get running test', () => {
    return mock.getTest().then((test) => {
      expect(test.expectations.length).to.equal(1);
      expect(test.expectations[0].request.method).to.equal('get');
      expect(test.expectations[0].request.url).to.equal('/users/test');
      expect(test.expectations[0].request.body).to.deep.equal({ hello: 'world' });
      expect(test.expectations[0].response.status).to.equal(200);
      expect(test.expectations[0].response.body).to.deep.equal({
        id: 'test-id',
        username: 'username',
      });
      expect(test.expectations[0].repeat).to.equal(1);
      expect(test.expectations[0].testId).to.equal('e2e');
      expect(test.expectations[0].id.length).to.equal(36);
    })
  });
});
