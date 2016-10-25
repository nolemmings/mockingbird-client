import Mockingbird from '../src/client';
import rp from 'request-promise';
import { expect } from 'chai';

/**
 * Makes a JSON request to the mockingbird server.
 */
function makeRequest(url, body) {
  const options = {
    method: 'GET',
    uri: url,
    headers: {
      Accept: 'application/json',
    },
    json: true,
    simple: false,
    resolveWithFullResponse: true,
    body: body,
  };
  return rp(options);
}

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

  it('should succesfully mock request expectation', () => {
    const body = { hello: 'world' };
    return makeRequest(`${mock.url}/users/test`, body)
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.id).to.equal('test-id');
        expect(res.body.username).to.equal('username');
      });
  });

  it('should fail expectation if request url is invalid', () => {
    const body = { hello: 'world' };
    return makeRequest(`${mock.url}/users/invalid`, body)
      .then((res) => {
        expect(res.statusCode).to.equal(404);
        expect(res.body.error).to.equal('Expectation \'GET /tests/e2e/users/invalid\' not found in test \'e2e\'');
        expect(res.body.request.method).to.equal('GET');
        expect(res.body.request.originalUrl).to.equal('/tests/e2e/users/invalid');
        expect(res.body.request.body).to.deep.equal({ hello: 'world' });
      });
  });

  it('should fail expectation if request body is invalid', () => {
    const body = { hello: 'invalid' };
    return makeRequest(`${mock.url}/users/test`, body)
      .then((res) => {
        expect(res.statusCode).to.equal(404);
        expect(res.body.error).to.equal('Expectation \'GET /tests/e2e/users/test\' not found in test \'e2e\'');
        expect(res.body.request.method).to.equal('GET');
        expect(res.body.request.originalUrl).to.equal('/tests/e2e/users/test');
        expect(res.body.request.body).to.deep.equal({ hello: 'invalid' });
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
    });
  });

  it('should verify expectAllConsumed when no expectations are left', () => {
    const body = { hello: 'world' };
    return makeRequest(`${mock.url}/users/test`, body)
      .then(() => {
        return mock.expectAllConsumed();
      });
  });

  it('should throw error when expectAllConsumed finds expectation that has not been consumed ', () => {
    return mock.expectAllConsumed()
      .catch((err) => {
        expect(err.message).to.equal('Expected url /users/test to be called 1 times but was called 0 times');
      });
  });

  it('should wait for all mocks to be registered properly using mock.ready()', () => {
    mock.get('/users/test2').reply(204);
    mock.get('/users/test3').reply(204);
    mock.get('/users/test4').reply(204);
    mock.get('/users/test5').reply(204);
    mock.get('/users/test6').reply(204);
    mock.get('/users/test7').reply(204);
    mock.post('/users/test8').reply(204);
    mock.patch('/users/test9').reply(204);
    mock.delete('/users/test10').reply(204);
    return mock.ready().then(() => {
      return mock.getTest();
    }).then((test) => {
      expect(test.expectations.length).to.equal(10);
    });
  });
});
