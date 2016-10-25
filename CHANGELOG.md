# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Changed
- Prepublish now also runs test suite
- Refactor `.reply()` to return promise
- Rename `.end()` to `._end()` to indicate it is a private method
- Add test for `mockingbird.getTest()`
- Update readme

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