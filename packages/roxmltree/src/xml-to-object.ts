import { parseString, type TXmlEvents, type TXMLToken } from './tokenizer';
import { parseXml, type WT } from './wasm';

interface XMLNode {
	tagName: string;
	attributes: Record<string, string>;
	children: (XMLNode | string)[];
}

export function xmlToObjectWasm(xmlString: string): XMLNode {
	const root: XMLNode = {
		tagName: 'root',
		attributes: {},
		children: []
	};
	const stack: XMLNode[] = [root];
	let currentNode: XMLNode = root;

	parseXml(xmlString, false, (token: WT.Token) => {
		switch (token.type) {
			case 'ElementStart': {
				const newNode: XMLNode = {
					tagName: getFullName(token.prefix, token.local),
					attributes: {},
					children: []
				};
				currentNode.children.push(newNode);
				stack.push(newNode);
				currentNode = newNode;
				break;
			}
			case 'ElementEnd': {
				if (token.end.type === 'Close' || token.end.type === 'Empty') {
					stack.pop();
					const newCurrentNode = stack[stack.length - 1];
					if (newCurrentNode != null) {
						currentNode = newCurrentNode;
					}
				}
				break;
			}
			case 'Attribute': {
				const attrName = getFullName(token.prefix, token.local);
				currentNode.attributes[attrName] = token.value.text;
				break;
			}
			case 'Text':
			case 'Cdata': {
				const trimmedText = token.text.trim();
				if (trimmedText.length > 0) {
					currentNode.children.push(token.text);
				}
				break;
			}
			case 'Comment':
			case 'ProcessingInstruction':
			case 'EntityDeclaration':
				break;
		}
	});

	return root.children[0] as unknown as XMLNode;
}

export function xmlToObject(xmlString: string): XMLNode {
	const root: XMLNode = {
		tagName: 'root',
		attributes: {},
		children: []
	};
	const stack: XMLNode[] = [root];
	let currentNode: XMLNode = root;

	const xmlEvents: TXmlEvents = {
		token: (token: TXMLToken) => {
			switch (token.type) {
				case 'ElementStart': {
					const newNode: XMLNode = {
						tagName: getFullName(token.prefix, token.local),
						attributes: {},
						children: []
					};
					currentNode.children.push(newNode);
					stack.push(newNode);
					currentNode = newNode;
					break;
				}
				case 'ElementEnd': {
					if (token.end.type === 'Close' || token.end.type === 'Empty') {
						stack.pop();
						const newCurrentNode = stack[stack.length - 1];
						if (newCurrentNode != null) {
							currentNode = newCurrentNode;
						}
					}
					break;
				}
				case 'Attribute': {
					const attrName = getFullName(token.prefix, token.local);
					currentNode.attributes[attrName] = token.value.toString();
					break;
				}
				case 'Text':
				case 'Cdata': {
					const trimmedText = token.text.trim();
					if (trimmedText.length > 0) {
						currentNode.children.push(token.text);
					}
					break;
				}
				case 'Comment':
				case 'ProcessingInstruction':
				case 'EntityDeclaration':
					break;
			}
		}
	};

	parseString(xmlString, false, xmlEvents);
	return root.children[0] as unknown as XMLNode;
}

function getFullName(prefix: string, local: string): string {
	return prefix ? `${prefix}:${local}` : local;
}
