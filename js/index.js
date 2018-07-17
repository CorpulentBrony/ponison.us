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
		outputAudio: undefined,
		scriptList: undefined, 
		selectOutputFormat: undefined, 
		selectPonies: undefined,
		templateOutputAudio: undefined,
		templateSoundType: undefined
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
		const inputId = `input-${soundType.name.toLowerCase()}`;
		const soundTypeItem = window.document.importNode(elements.templateSoundType.content, true);
		const input = soundTypeItem.querySelector("input");
		const label = soundTypeItem.querySelector("label");
		[input.id, input.value] = [inputId, soundType.name];
		label.setAttribute("for", inputId);
		label.textContent = `${soundType.name} (`;
		createElement("a", { href: window.encodeURI(`/pony/${ponyName}/${soundType.name}/`), target: "_blank", type: "text/html" }, label, soundType.numberAvailable);
		label.appendChild(window.document.createTextNode(")"));
		parent.appendChild(soundTypeItem);
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
			.then((response) => response.json())
			.then(processResponse)
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

	function processResponse(response) {
		console.log(response);
		const templateOutputAudio = window.document.importNode(elements.templateOutputAudio.content, true);
		const a = templateOutputAudio.querySelector("a");
		[a.download, a.href] = [`PoniSonus ${elements.selectPonies.value} ${window.Math.floor((window.Math.random() + 1) * 0x1000000).toString(32).substring(1)}.mp3`, `//api.ponison.us/${response.outputFile.url}`];
		const data = templateOutputAudio.querySelectorAll("data");
		//const time = templateOutputAudio.querySelectorAll("time");
		

		templateOutputAudio.querySelector("code").textContent = JSON.stringify(response);
		elements.outputAudio.appendChild(templateOutputAudio);
		// <ul>
		// 	<li>
		// 		<ul>
		// 			<li><a download type="audio/mpeg">Download Result</a></li>
		// 			<li>Audio file is <time id="time-duration"></time> long and <data id="data-size"></data> large and will be available for download for <time id="time-lifetime"></time></li>
		// 		</ul>
		// 	</li>
		// 	<li>It took <time id="time-processing"></time> to generate the sound file</li>
		// 	<li>There were <data id="data-used-sound-types"></data> sound types used out of the total possible <data id="data-total-sound-types"></data> (<data id="data-percent-of-total"></data> of total)</li>
		// </ul>
		// <code></code>
	}

	function removeAllChildren(node) {
		while (node.firstChild)
			node.removeChild(node.firstChild);
		return node;
	}

	function selectPoniesOnChange() {
		removeAllChildren(elements.divSoundTypes).appendChild(soundTypeOptionsMap.get(elements.selectPonies.value).cloneNode(true));
		elements.inputSelectAll.checked = true;
	}

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