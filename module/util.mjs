export function createElement(name, attributes = {}, parent = undefined, text = undefined) {
	const element = window.document.createElement(name);
	setAttributes(element, attributes);

	if (text !== undefined)
		element.textContent = text;

	if (parent !== undefined)
		parent.appendChild(element);
	return element;
}

export function removeAllChildren(node) {
	while (node.firstChild)
		node.removeChild(node.firstChild);
	return node;
}

export function setAttributes(element, attributes = {}) {
	for (const key in attributes)
		if (key === "textContent")
			element.textContent = attributes[key];
		else
			element.setAttribute(key, attributes[key]);
	return element;
}