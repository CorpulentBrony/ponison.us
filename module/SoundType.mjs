import { elements } from "./Elements.mjs";
import { createElement } from "./util.mjs";

const privates = {
	element: new window.WeakMap(),
	template: undefined
};

class Option {
	static create(ponyName, soundType) { return new this(ponyName, soundType); }
	static getTemplate() { return privates.template ? privates.template : privates.template = elements.templateSoundType.content; }

	constructor(ponyName, soundType) {
		this.content = this.constructor.getTemplate().cloneNode(true);
		const id = `input-${soundType.name.toLowerCase()}`;
		const input = this.content.querySelector("input");
		const label = this.content.querySelector("label");
		[input.id, input.value] = [id, soundType.name];
		label.setAttribute("for", id);
		label.textContent = `${soundType.name} (`;
		createElement("a", { href: window.encodeURI(`/pony/${ponyName}/${soundType.name}/`), target: "_blank", type: "text/html" }, label, soundType.numberAvailable);
		label.appendChild(window.document.createTextNode(")"));
	}
}

export class Options extends window.Map {
	set(key, { ponyName, soundTypes }) { super.set(key, new Selectors(ponyName, soundTypes)); }
}

class Selectors {
	constructor(ponyName, soundTypes) {
		this.content = window.document.createDocumentFragment();
		soundTypes.forEach((soundType) => this.content.appendChild(Option.create(ponyName, soundType).content));
	}
}