# Mockingbird Client

This is a client library for [Mockingbird](https://github.com/nolemmings/mockingbird).

Mockingbird is intended to as a separate HTTP server with mocked requests while running your normal tests. You'll have to configure you system under test in such a way it directs its requests to the temporary mock server.

## Install

```
npm install --save-dev mockingbird mockingbird-client
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
});

```
