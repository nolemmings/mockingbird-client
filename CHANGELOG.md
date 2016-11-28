# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.2.2] - 2016-11-28
### Changed
- `start()` now returns a promise with the running mock server

## [0.2.1] - 2016-11-28
### Fixed
- request-promise dependency is now installed as normal dependency rather than devDependency

## [0.2.0] - 2016-11-04
### Changed
- Updated peerDependency for mockingbird to 0.3
- Body is now always sent as string to mockingbird

## [0.1.0] - 2016-10-25
### Added
- Add tests for various scenarios
- Add `ready()` which waits until all pending promises are fulfilled

### Changed
- Prepublish now also runs test suite
- Refactor `reply()` to return pending promise
- Rename `end()` to `_end()` to indicate it is a private method
- Update readme
- Error message `expectAllConsumed()` no longer contains a newline

## [0.0.4] - 2016-10-24
### Changed
- `clean()` now ignores 404 when expectation is not found in test

## [0.0.3] - 2016-10-24
### Changed
- Throw error when invoking methods after `reply()` has been called.

## [0.0.2] - 2016-10-24
### Changed
- Add changelog file

### Fixed
- Importing mockingbird-client now imports correct client.js main file

## [0.0.1] - 2016-10-19
### Changed
- Initial release
