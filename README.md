# Mockingbird Client

This is a client library for [Mockingbird](https://github.com/nolemmings/mockingbird).

Mockingbird is intended as a separate HTTP server with mocked requests while running your normal tests. You'll have to configure your system under test in such a way it directs its requests to the temporary mock server.

## Install

```
npm install --save-dev @nolemmings/mockingbird @nolemmings/mockingbird-client
```

## Example

The following is an example in Mocha:

```js
import Mockingbird from '@nolemmings/mockingbird-client';
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

  it('should get a user', () => {
    return mock.get('/users/test').reply(200, {
      id: 'test-id',
      username: 'username',
    }).then(() => {
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
  });
});

```

By default, mockingbird will be run at `http://localhost:5000/tests/e2e`. You can configure the `port` and `testId` (`e2e`) in the constructor:

```
new Mockingbird(5000, 'e2e');
```

## getTest()

Returns the test currently being run registered in the Mockingbird server. Example:

```js
mock.getTest().then((test) => {
  // Test contains
  {
    expectations: [{
       request: { method: 'get', url: '/users/test', body: { hello: 'world' } },
       response: { status: 200, body: { id: 'test-id', username: 'username' } },
       repeat: 1,
       testId: 'e2e',
       requestCount: 0,
       id: 'c1fb3b82-21d9-4975-bb54-b21866451ab2'
    }]
  }
});
```
