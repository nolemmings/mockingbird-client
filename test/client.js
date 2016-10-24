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

  afterEach(() => {
    return mock.clean(); // Clean state after each test
  });

  it('should mock a user request', () => {
    mock.get('/users/test').reply(200, {
      id: 'test-id',
      username: 'username',
    });

    const options = {
      method: 'GET',
      uri: `${mock.url}/users/test`,
      headers: {
        Accept: 'application/json',
      },
      json: true,
      resolveWithFullResponse: true,
    };
    return rp(options).then((res) => {
      expect(res.statusCode).to.equal(200);
      expect(res.body.id).to.equal('test-id');
      expect(res.body.username).to.equal('username');
    });
  });

  it('should issue an error when calling a function on finished request', () => {
    const func = () => {
      mock.get('/users/test')
        .reply(200, {
          id: 'test-id',
          username: 'username',
        })
        .repeat(100);
    };
    expect(func).to.throw(/may not be called after reply/);
  });
});
