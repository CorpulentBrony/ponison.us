"use strict";
(function index() {
	const API_URL = "//api.ponison.us/index.php";

	const elements = {
		buttonGetAudio: undefined, 
		divSoundTypes: undefined, 
		fieldsetTiming: undefined,
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
		const soundTypeItem = elements.templateSoundType.content.cloneNode(true);
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
		window.fetch(API_URL, { body, headers: { ["Content-Type"]: "application/json" }, method: "POST" })
			.then((response) => response.json())
			.then(checkResponseError)
			.then(processResponse)
			.catch(console.error);
	}

	function checkResponseError(response) {
		if (!response)
			throw "Could not parse response or an empty response received";
		else if (response.responseType === "error")
			throw response.response;
		return response;
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

	function fieldsetTimingOnChange() {
		elements.inputDesiredLengthSeconds.poni_checkValue();
		setAttributes(elements.inputMinDelaySeconds, { max: elements.inputDesiredLengthSeconds.value, maxlength: String(elements.inputDesiredLengthSeconds.value).length + 2 });
		elements.inputMinDelaySeconds.setAttribute("max", elements.inputDesiredLengthSeconds.value);
		elements.inputMinDelaySeconds.poni_checkValue();
		setAttributes(elements.inputMaxDelaySeconds, { max: elements.inputDesiredLengthSeconds.value, maxlength: String(elements.inputDesiredLengthSeconds.value).length + 2, min: elements.inputMinDelaySeconds.value });
		elements.inputMaxDelaySeconds.poni_checkValue();
	}

	function getSelectedSoundTypes() {
		return Array.prototype.reduce.call(divSoundTypeInputs, (selectedSoundTypes, inputSoundType) => {
			if (inputSoundType.checked)
				selectedSoundTypes.push(inputSoundType.value);
			return selectedSoundTypes;
		}, new window.Array());
	}

	function initLists() {
		const list = checkResponseError(window.JSON.parse(elements.scriptList.textContent));

		if (!window.Array.isArray(list.response) || list.response.length === 0)
			throw "Received an invalid response";
		const ponyOptions = window.document.createDocumentFragment();
		list.response.forEach((pony) => {
			const soundTypes = window.document.createDocumentFragment();
			createElement("option", {}, ponyOptions, pony.name);
			pony.soundTypes.forEach(addSoundTypeToList.bind(undefined, soundTypes, pony.name));
			soundTypeOptionsMap.set(pony.name, soundTypes);
		});
		elements.selectPonies.appendChild(ponyOptions);
		selectPoniesOnChange();
		const outputFormatOptions = window.document.createDocumentFragment();

		for (const outputFormat in list.requestProperties.validOutputFormats)
			createElement("option", {}, outputFormatOptions, outputFormat);
		elements.selectOutputFormat.appendChild(outputFormatOptions);
		setAttributes(elements.inputDesiredLengthSeconds, {
			max: list.requestProperties.maxDesiredLengthSeconds,
			maxlength: String(list.requestProperties.maxDesiredLengthSeconds).length,
			min: list.requestProperties.minDesiredLengthSeconds
		});
		elements.inputMinDelaySeconds.setAttribute("min", list.requestProperties.minDelaySeconds);
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

	// in js, download file from url given in response
	// in js, create link to manually download file in case automatic downloading does not work
	// set link to expire when lifetime number of seconds given in response have elapsed
	async function processResponse(response) {
		response = response.response;
		console.log(response);
		const audio = await window.fetch(response.outputFile.url).then((response) => response.blob());
		const audioUrl = window.URL.createObjectURL(audio);
		const download = `PoniSonus ${elements.selectPonies.value} ${window.Math.floor((window.Math.random() + 1) * 0x1000000).toString(32).substring(1)}.${elements.selectOutputFormat.value}`;
		const templateOutputAudio = elements.templateOutputAudio.content.cloneNode(true);
		const audioElement = templateOutputAudio.querySelector("video");
		try { audioElement.srcObject = audio; }
		catch (err) { audioElement.src = audioUrl; }
		templateOutputAudio.querySelector("track").setAttribute("src", window.URL.createObjectURL(new window.Blob([response.timingLog], { type: "text/vtt" })));
		setAttributes(templateOutputAudio.querySelector("a"), { download, href: audioUrl });
		setAttributes(templateOutputAudio.getElementById("time-duration"), { datetime: `PT${response.outputFile.durationSeconds}S`, textContent: `${response.outputFile.durationSeconds} seconds` }).removeAttribute("id");
		setAttributes(templateOutputAudio.getElementById("data-size"), { textContent: `${response.outputFile.sizeBytes} bytes`, value: response.outputFile.sizeBytes }).removeAttribute("id");
		setAttributes(templateOutputAudio.getElementById("time-lifetime"), { datetime: `PT${response.outputFile.lifetimeSeconds}S`, textContent: `${response.outputFile.lifetimeSeconds} seconds` }).removeAttribute("id");
		setAttributes(templateOutputAudio.getElementById("time-processing"), { datetime: `PT${response.generationTimeElapsedSeconds}S`, textContent: `${response.generationTimeElapsedSeconds} seconds`}).removeAttribute("id");
		setAttributes(templateOutputAudio.getElementById("data-used-sound-types"), { textContent: `${response.numberSoundTypesUsed} sound types`, value: response.numberSoundTypesUsed }).removeAttribute("id");
		setAttributes(templateOutputAudio.getElementById("data-total-sound-types"), { textContent: String(response.totalSoundTypesSelected), value: response.totalSoundTypesSelected }).removeAttribute("id");
		const soundTypePercentageUsed = response.numberSoundTypesUsed / response.totalSoundTypesSelected;
		setAttributes(templateOutputAudio.getElementById("data-percent-of-total"), { textContent: `${Number(soundTypePercentageUsed * 100).toFixed(2)}%`, value: soundTypePercentageUsed }).removeAttribute("id");
		templateOutputAudio.querySelector("code").textContent = JSON.stringify(response);
		removeAllChildren(elements.outputAudio).appendChild(templateOutputAudio);
		// window.setTimeout(() => removeAllChildren(elements.outputAudio), response.outputFile.lifetimeSeconds * 1000);
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
			if (key === "textContent")
				element.textContent = attributes[key];
			else
				element.setAttribute(key, attributes[key]);
		return element;
	}

	(async function onDocumentLoad() {
		await isDocumentLoaded;

		for (const name in elements)
			elements[name] = window.document.getElementById(name.replace(/([A-Z])/g, (c) => `-${c[0].toLowerCase()}`));
		elements.inputDesiredLengthSeconds.poni_checkValue = elements.inputMinDelaySeconds.poni_checkValue = elements.inputMaxDelaySeconds.poni_checkValue = function() {
			this.value = window.Math.min(window.Math.max(Number(this.value), Number(this.min)), Number(this.max));
		};
		initLists();
		divSoundTypeInputs = elements.divSoundTypes.querySelectorAll("input");
		elements.buttonGetAudio.addEventListener("click", buttonGetAudioOnClick, false);
		elements.divSoundTypes.addEventListener("change", divSoundTypesOnChange, false);
		elements.fieldsetTiming.addEventListener("change", fieldsetTimingOnChange, false);
		elements.inputSelectAll.addEventListener("change", inputSelectAllOnChange, false);
		elements.selectPonies.addEventListener("change", selectPoniesOnChange, false);
	})().catch(console.error);
})();