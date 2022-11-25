const lintBem = require('./src/index.js');
const render = require('posthtml-render');

module.exports = {
	getPosthtmlBemLinter:
		({ getSourceName = (filename) => filename, log = console, modifier = '--' } = {}) =>
		async (tree) => {
			lintBem({
				content: render(tree),
				name: getSourceName(tree.options.from),
				log,
				modifier
			});

			return tree;
		},
	lintBem
};
