"use strict";
(function index() {
	const API_URL = "//api.ponison.us/index.php";

	const elements = {
		buttonGetAudio: undefined, 
		divSoundTypes: undefined, 
		inputDesiredLengthSeconds: undefined, 
		inputMaxDelaySeconds: undefined, 
		inputMinDelaySeconds: undefined, 
		scriptList: undefined, 
		selectOutputFormat: undefined, 
		selectPonies: undefined
	};
	const isDocumentLoaded = new window.Promise((resolve) => {
		if (window.document.readyState === "loading")
			window.document.addEventListener("DOMContentLoaded", resolve, false);
		else
			resolve();
	});
	const soundTypeOptionsMap = new window.Map();

	function addSoundTypeToList(parent, ponyName, soundType) {
		const span = createElement("span", {}, parent);
		const inputId = `input-${soundType.name.toLowerCase()}`;
		createElement("input", { id: inputId, type: "checkbox", value: soundType.name }, span);
		const label = createElement("label", { for: inputId }, span);
		createElement("a", { href: `/pony/${ponyName}/${soundType.name}/`, target: "_blank", type: "text/html" }, label, soundType.name);
		label.appendChild(window.document.createTextNode(` (${soundType.numberAvailable})`));
	}

	function buttonGetAudioOnClick() {
		const body = JSON.stringify({
			requestType: "audio", 
			desiredLengthSeconds: window.Number(elements.inputDesiredLengthSeconds.value),
			inputMaxDelaySeconds: window.Number(elements.inputMaxDelaySeconds.value),
			inputMinDelaySeconds: window.Number(elements.inputMinDelaySeconds.value),
			outputFormat: elements.selectOutputFormat.value,
			ponies: [elements.selectPonies.value], 
			soundTypes: elements.divSoundTypes.value
		});
		fetch(API_URL, { body, headers: { ["Content-Type"]: "application/json" }, method: "POST" })
			.then((response) => response.text())
			.then(console.log)
			.catch(console.error);
			// <!-- {
			//     "requestType": "audio",
			//     "desiredLengthSeconds": [1..3600],
			//     "minDelaySeconds": [0..maxDelaySeconds],
			//     "maxDelaySeconds": [minDelaySeconds..desiredLengthSeconds],
			//     "outputFormat": string,
			//     "ponies": Array<string>,
			//     "soundTypes": Array<string>
			// } -->
	}

	function createElement(name, attributes = {}, parent = undefined, text = undefined) {
		const element = window.document.createElement(name);
		setAttributes(element, attributes);

		if (text !== undefined)
			element.textContent = text;

		if (parent !== undefined)
			parent.appendChild(element);
		return element;
	}

	function initLists() {
		const list = window.JSON.parse(elements.scriptList.textContent);
		const ponyOptions = window.document.createDocumentFragment();
		list.forEach((pony) => {
			const soundTypes = window.document.createDocumentFragment();
			createElement("option", {}, ponyOptions, pony.name);
			pony.soundTypes.forEach(addSoundTypeToList.bind(undefined, soundTypes, pony.name));
			soundTypeOptionsMap.set(pony.name, soundTypes);
		});
		elements.selectPonies.appendChild(ponyOptions);
		selectPoniesOnChange();
	}

	function removeAllChildren(node) {
		while (node.firstChild)
			node.removeChild(node.firstChild);
		return node;
	}

	function selectPoniesOnChange() { removeAllChildren(elements.divSoundTypes).appendChild(soundTypeOptionsMap.get(elements.selectPonies.value).cloneNode(true)); }

	function setAttributes(element, attributes = {}) {
		for (const key in attributes)
			element.setAttribute(key, attributes[key]);
	}

	(async function onDocumentLoad() {
		await isDocumentLoaded;

		for (const name in elements)
			elements[name] = window.document.getElementById(name.replace(/([A-Z])/g, (c) => `-${c[0].toLowerCase()}`));
		initLists();
		elements.buttonGetAudio.addEventListener("click", buttonGetAudioOnClick, false);
		elements.selectPonies.addEventListener("change", selectPoniesOnChange, false);
	})().catch(console.error);
})();