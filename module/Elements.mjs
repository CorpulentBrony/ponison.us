class Elements {
	static getElementByProperty(property) { return window.document.getElementById(property.replace(/([A-Z])/g, (c) => `-${c[0].toLowerCase()}`)); }
}

export const elements = new window.Proxy(Elements, {
	get: function(target, property) {
		if (property in target)
			return target[property];
		return target[property] = Elements.getElementByProperty(property);
	},
	has: function(target, property) {
		if (property in target)
			return true;
		const element = Elements.getElementByProperty(property);

		if (!(element instanceof window.HTMLElement))
			return false;
		target[property] = element;
		return true;
	}
});