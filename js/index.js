"use strict";
(function index() {
	const API_URL = "//api.ponison.us/index.php";

	const elements = {
		buttonGetAudio: undefined, 
		divSoundTypes: undefined, 
		inputDesiredLengthSeconds: undefined, 
		inputMaxDelaySeconds: undefined, 
		inputMinDelaySeconds: undefined, 
		inputSelectAll: undefined,
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
	let divSoundTypeInputs = undefined;

	function addSoundTypeToList(parent, ponyName, soundType) {
		const span = createElement("span", {}, parent);
		const inputId = `input-${soundType.name.toLowerCase()}`;
		createElement("input", { id: inputId, type: "checkbox", value: soundType.name }, span);
		const label = createElement("label", { for: inputId }, span, `${soundType.name} (`);
		createElement("a", { href: window.encodeURI(`/pony/${ponyName}/${soundType.name}/`), target: "_blank", type: "text/html" }, label, soundType.numberAvailable);
		label.appendChild(window.document.createTextNode(")"));
	}

	function buttonGetAudioOnClick() {
		const body = JSON.stringify({
			requestType: "audio", 
			desiredLengthSeconds: window.Number(elements.inputDesiredLengthSeconds.value),
			maxDelaySeconds: window.Number(elements.inputMaxDelaySeconds.value),
			minDelaySeconds: window.Number(elements.inputMinDelaySeconds.value),
			outputFormat: elements.selectOutputFormat.value,
			ponies: [elements.selectPonies.value], 
			soundTypes: getSelectedSoundTypes()
		});
		fetch(API_URL, { body, headers: { ["Content-Type"]: "application/json" }, method: "POST" })
			.then((response) => response.text())
			.then(console.log)
			.catch(console.error);
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

	function divSoundTypesOnChange() { inputSelectAllSetStatus(); }

	function getSelectedSoundTypes() {
		return Array.prototype.reduce.call(divSoundTypeInputs, (selectedSoundTypes, inputSoundType) => {
			if (inputSoundType.checked)
				selectedSoundTypes.push(inputSoundType.value);
			return selectedSoundTypes;
		}, new window.Array());
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

	function inputSelectAllOnChange() { divSoundTypeInputs.forEach((inputSoundType) => inputSoundType.checked = elements.inputSelectAll.checked); }

	function inputSelectAllSetStatus() {
		const divSoundTypesSelected = Array.prototype.filter.call(divSoundTypeInputs, (inputSoundType) => inputSoundType.checked);
		let state;

		if (divSoundTypesSelected.length === divSoundTypeInputs.length)
			state = { checked: true, indeterminate: false };
		else if (divSoundTypesSelected.length > 0)
			state = { checked: false, indeterminate: true };
		else
			state = { checked: false, indeterminate: false };
		window.Object.assign(elements.inputSelectAll, state);
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
		divSoundTypeInputs = elements.divSoundTypes.querySelectorAll("input");
		elements.buttonGetAudio.addEventListener("click", buttonGetAudioOnClick, false);
		elements.divSoundTypes.addEventListener("change", divSoundTypesOnChange, false);
		elements.inputSelectAll.addEventListener("change", inputSelectAllOnChange, false);
		elements.selectPonies.addEventListener("change", selectPoniesOnChange, false);
	})().catch(console.error);
})();