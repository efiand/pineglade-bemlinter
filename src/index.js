const htmlParser = require('node-html-parser');
const generateAnciiTree = require('./generateAnciiTree.js');

const SUCCESS_COLOR = 'green';
const ERROR_COLOR = 'red';

let countBemWarning = 0;

function createNode({ label, color }) {
	return {
		label,
		color,
		nodes: []
	};
}

function createLabelTree(element) {
	let label = element.tagName;
	if (element.id) {
		label += `#${element.id.split(' ').join('#')}`;
	}
	if (element.classList.length) {
		label += `.${element.classList.value.join('.')}`;
	}

	return label;
}

function htmlThreeFormatAst(htmlTree, modifier = '--') {
	let ast = {};
	for (let element of htmlTree.childNodes) {
		if (element.nodeType !== 1) {
			continue;
		}
		ast = createNode({ label: createLabelTree(element), color: SUCCESS_COLOR });

		element.parentElement = null;

		element.classList.value.forEach((name) => {
			if (name.split('__').length === 1 && name.replace(/__/g, '').split(modifier).length === 1) {
				if (!element.customDataSet) {
					element.customDataSet = {
						prefixes: {},
						parentElement: null
					};
				}
				element.customDataSet.prefixes[name] = name;
			}
		});

		formatTree({
			htmlNodes: element.childNodes,
			astNodes: ast.nodes,
			parent: element,
			modifier
		});
	}

	return ast;
}

/**
 * Function copies classes to a child element from parent!
 * @param {Object} elements - The element of a node-html-parse three.
 * @param {Object} elements.element - The element of a node-html-parse three.
 * @param {Object} elements.parent - The parent of a element node-html-parse three.
 */
function copyParentPrefixes({ element, parent }) {
	if (!parent || !parent.customDataSet) {
		return;
	}

	for (let prefix in parent.customDataSet.prefixes) {
		element.customDataSet.prefixes[prefix] = prefix;
	}
}

/**
 * Function copies and split classes.
 * @param {Object} elements - The element of a node-html-parse three.
 * @param {Object} elements.element - The element of a node-html-parse three.
 * @param {Object} elements.parent - The parent of a element node-html-parse three.
 */
function addClassesAsPrefixes({ element, parent, modifier = '--' }) {
	copyParentPrefixes({ element, parent });

	element.classList.value.forEach((name) => {
		if (name.split('__').length === 1 && name.replace(/__/g, '').split(modifier).length === 1) {
			element.customDataSet.prefixes[name] = name;
		}
	});
}

/**
 * Function formats a ast tree. This function is recursive!
 * @param {Object} nodes - The trees what are  for the project.
 * @param {Object} nodes.htmlNodes[] - The html tree of node-html-parse.
 * @param {Object} nodes.astNodes[] - The ast tree classic-ancii-tree.
 * @param {Object} nodes.parent - The parent element of htmlNodes.
 */
function formatTree({ htmlNodes, astNodes, parent, modifier = '--' }) {
	for (let element of htmlNodes) {
		if (element.nodeType !== 1) {
			continue;
		}

		if (!element.customDataSet) {
			element.customDataSet = {
				prefixes: {},
				parentElement: parent
			};
		}

		addClassesAsPrefixes({ element, parent, modifier });
		checkBemElement(element, modifier);

		let node = createNode({
			label: createLabelTree(element),
			color: element.customDataSet.hasError ? ERROR_COLOR : SUCCESS_COLOR
		});
		astNodes.push(node);

		if (element.childNodes.length) {
			formatTree({ htmlNodes: element.childNodes, astNodes: node.nodes, parent: element, modifier });
		}
	}
}

function checkBemElement(element, modifier = '--') {
	const { value } = element.classList;

	if (value.join().indexOf('__') < 0 && value.join().replace(/__/g, '').indexOf(modifier) < 0) {
		return false;
	}

	const classItemsWithoutElements = value.map((item) => item.replace(/__/g, ''));

	value.forEach((classItem) => {
		let prefixCorrect = false;
		if (classItem.split('__').length > 2) {
			countBemWarning++;
			element.customDataSet.hasError = true;
		} else {
			if (classItem.split('__').length > 1) {
				let prefix = classItem.split('__')[0];

				if (element.customDataSet.prefixes[prefix]) {
					prefixCorrect = true;
				}

				if (!prefixCorrect) {
					countBemWarning++;

					element.customDataSet.hasError = true;
				}
			}
		}

		// modifier
		const splits = classItem.replace(/__/g, '').split(modifier);
		if (splits.length > 1) {
			if (!classItemsWithoutElements.some((item) => item === splits[0])) {
				countBemWarning++;

				element.customDataSet.hasError = true;
			}
		}
	});
}

function htmlBemlinter({ content, modifier = '--' }) {
	let htmlThree = htmlParser.parse(content);
	let treeAst = htmlThreeFormatAst(htmlThree, modifier);
	let warningCount = countBemWarning;
	countBemWarning = 0;

	return {
		warningCount,
		treeAst
	};
}

module.exports = ({ name, content, log = console, modifier = '--' }) => {
	const { warningCount, treeAst } = htmlBemlinter({ name, content, modifier });

	if (warningCount) {
		log.warn(generateAnciiTree(treeAst));
		log.error(`BEM linting: ${warningCount} error${warningCount > 1 ? 's' : ''} found in ${name}`);
		process.exitCode = 1;
	}
};
