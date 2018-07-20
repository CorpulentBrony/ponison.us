export const isDocumentLoaded = new window.Promise((resolve) => {
	if (window.document.readyState === "loading")
		window.document.addEventListener("DOMContentLoaded", resolve, false);
	else
		resolve();
});

export function createElement(name, attributes = {}, parent = undefined, text = undefined) {
	const element = window.document.createElement(name);
	setAttributes(element, attributes);

	if (text !== undefined)
		element.textContent = text;

	if (parent !== undefined)
		parent.appendChild(element);
	return element;
}

export function detectDynamicImport() {
	try { new window.Function("import(\"\")"); }
	catch (err) { return false; }
	return true;
}

export async function loadDeferredStylesheets(containerId = "noscript-deferred-stylesheets") {
	const parser = new window.DOMParser();
	const loader = () => parser.parseFromString(document.getElementById(containerId).textContent, "text/html").querySelectorAll("link").forEach((link) => window.document.head.appendChild(link));
	const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

	if (requestAnimationFrame)
		requestAnimationFrame(() => window.setTimeout(loader.call(undefined), 0));
	else {
		await isDocumentLoaded;
		loader.call(undefined);
	}
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