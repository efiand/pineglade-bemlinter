# posthtml-bem-linter[ ![npm version](https://img.shields.io/npm/v/posthtml-bem-linter.svg)](https://www.npmjs.com/package/posthtml-bem-linter)

Pure function and posthtml plugin for linting a bem html. Fork of [gulp-html-bemlinter](https://www.npmjs.com/package/gulp-html-bemlinter).

Additions:
- Support `modifier` option (default value is `--`).
- No flood on success.

## Usage

First, install `posthtml-bem-linter` as a development dependency:

```bash
npm i --DE posthtml-bem-linter
```

Then, add it to your `posthtml.config.js`:

```js
const { getPosthtmlBemLinter } = require('posthtml-bem-linter');

module.exports = {
  plugins: [
    getPosthtmlBemLinter({
      getSourceName: (filename) => filename,
      log: console,
      modifier: '--'
    })
  ]
};
```

(There are default values of optional params `getSourceName`, `log` and `modifier` in this example.)

Or use function `lintBem` in pure Node:

```js
const { lintBem } = require('posthtml-bem-linter');

// ...

lintBem({
  name,
  content,
  log: console,
  modifier: '--'
});
```

(There are default values of optional params `log` and `modifier` in this example.)
