# Mockingbird Client

This is a client library for [Mockingbird](https://github.com/nolemmings/mockingbird).

Mockingbird is intended as a separate HTTP server with mocked requests while running your normal tests. You'll have to configure your system under test in such a way it directs its requests to the temporary mock server.

## Install

```
npm install --save-dev @nolemmings/mockingbird @nolemmings/mockingbird-client
```

## Example

The following is an example in Mocha (which accepts promises as a return value):

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
    mock.get('/users/test').reply(200, {
      id: 'test-id',
      username: 'username',
    });
    mock.ready(() => {
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

## ready()

After registering your expectation call `mock.ready()` to send them to the mockingbird server and wait until all expectations have been registered at the mockingbird server.

Example:

```js
beforeEach(() => {
  mock.post('/users').reply(201, { id: '1' });
  mock.post('/users').reply(201, { id: '2' });
  mock.get('/users/1').reply(200, { id: '2' });
  mock.get('/users/2').reply(200, { id: '2' });
  mock.delete('/users/1').reply(204);
  mock.delete('/users/2').reply(204);
  return mock.ready();
});
```

## getTest()

Returns the test currently being run registered in the Mockingbird server.

Example:

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

## expectAllConsumed()

Returns a promise that fails when an expectation has not been consumed. Ignores expectations that are defined to repeat indefinitely.

Example:

```js
return mock.expectAllConsumed()
  .then(() => console.log('All is fine'))
  .catch((err) => console.log('Not all expectations are consumed', err));
```
