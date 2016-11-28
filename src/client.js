import rp from 'request-promise';
import mockingbirdServer from '@nolemmings/mockingbird';

class Expectation {
  constructor(url) {
    this.url = url;
    this.req = null;
    this.res = null;
    this.rep = 1;
    this.promise = null;
    this.finished = false;
  }

  request(method, url, body = undefined) {
    if (this.finished) {
      throw new Error('get()/post()/etc. may not be called after reply(...)');
    }

    // Convert body to a string when necessary
    let requestBody = body;
    if (typeof body !== 'undefined' && typeof body !== 'string') {
      if (typeof body === 'object' || typeof body === 'array') {
        requestBody = JSON.stringify(body);
      } else {
        requestBody = `${body}`;
      }
    }

    this.req = {
      method,
      url,
      body: requestBody,
    };
    return this;
  }

  reply(status, body = undefined, headers = undefined) {
    if (this.finished) {
      throw new Error('reply(...) cannot be called twice');
    }
    this.res = {
      status,
      headers,
      body,
    };
    return this._end();
  }

  repeat(repeat) {
    if (this.finished) {
      throw new Error('repeat(...) may not be called after reply(...)');
    }
    this.rep = repeat;
    return this;
  }

  /**
   * Adds expectation to the mockingbird server.
   */
  _end() {
    this.finished = true;
    this.promise = rp({
      method: 'post',
      url: `${this.url}/expectations`,
      json: true,
      body: {
        request: this.req,
        response: this.res,
        repeat: this.rep,
      },
    });
    return this.promise;
  }
}

/**
 * This class simplifies managing mockingbird expectations.
 */
class Mockingbird {
  constructor(port = 5000, testId = 'e2e') {
    this.server = null;
    this.port = port;
    this.url = `http://localhost:${this.port}/tests/${testId}`;
    this.expectations = [];
  }

  /**
   * Starts mock server. Returns a promise with the running mock server.
   */
  start() {
    return new Promise((resolve, reject) => {
      this.server = mockingbirdServer.listen(this.port, (err) => {
        if (err) return reject(err);
        resolve(this.server);
      });
    });
  }

  /**
   * Stops mock server.
   */
  stop() {
    this.server.close();
  }

  /**
   * Returns test with all its expectations.
   */
  getTest() {
    return rp({
      method: 'get',
      url: this.url,
      json: true,
    });
  }

  /**
   * Returns specified expectation.
   */
  getExpectation(id) {
    return rp({
      method: 'get',
      url: `${this.url}/expectations/${id}`,
      json: true,
    });
  }

  /**
   * Adds expectation.
   */
  request(method, url, body = undefined) {
    const expectation = (new Expectation(this.url)).request(method, url, body);
    this.expectations.push(expectation);
    return expectation;
  }

  /**
   * Waits until all request promises are fulfilled.
   */
  ready() {
    const promises = [];
    for (const expectation of this.expectations) {
      promises.push(expectation.promise);
    }
    return Promise.all(promises);
  }

  /**
   * Checks whether all specified tests have been consumed.
   */
  expectAllConsumed() {
    return this.getTest().then((result) => {
      for (const expectation of result.expectations) {
        if (expectation.repeat !== -1 && expectation.requestCount < expectation.repeat) {
          throw new Error(`Expected url ${expectation.request.url} to be called `
            + `${expectation.repeat} times but was called ${expectation.requestCount} times`);
        }
      }
    });
  }

  /**
   * Clears all expectations in Mockingbird.
   */
  clean() {
    this.expectations = [];
    return rp({
      method: 'delete',
      url: this.url,
    }).catch((error) =>{
      if (error.statusCode !== 404) {
        return Promise.reject(error);
      }
    });
  }
}


// Add helper methods for all HTTP verbs
['get', 'put', 'post', 'delete', 'patch', 'options', 'head'].forEach((method) => {
  Mockingbird.prototype[method] = function(...args) {
    return this.request(method, ...args);
  };
});

export default Mockingbird;
