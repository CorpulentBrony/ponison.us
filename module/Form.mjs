import { elements } from "./Elements.mjs";
import { Request } from "./Request.mjs";
import { Response } from "./Response.mjs";
import * as SoundType from "./SoundType.mjs";
import { createElement, setAttributes } from "./util.mjs";

export class Form {
	constructor() {
		this.soundTypeOptions = new SoundType.Options();
		this.buttonGetAudio = new ButtonGetAudio();
		this.divSoundTypes = new DivSoundTypes();
		this.fieldsetTiming = new FieldsetTiming();
		this.inputDesiredLengthSeconds = new InputDesiredLengthSeconds();
		this.inputMaxDelaySeconds = new InputMaxDelaySeconds();
		this.inputMinDelaySeconds = new InputMinDelaySeconds();
		this.inputSelectAll = new InputSelectAll();
		this.outputAudio = new OutputAudio();
		this.selectOutputFormat = new SelectOutputFormat();
		this.selectPonies = new SelectPonies();
	}
	addEventListeners() {
		this.buttonGetAudio.addEventListener("click", this.onSubmit.bind(this), false);
		this.divSoundTypes.addEventListener("change", this.divSoundTypes.onChange, false);
		this.fieldsetTiming.addEventListener("change", this.fieldsetTiming.onChange, false);
		this.inputSelectAll.addEventListener("change", this.inputSelectAll.onChange, false);
		this.selectPonies.addEventListener("change", this.selectPonies.onChange, false);
		return this;
	}
	bindChildEvents() {
		this.divSoundTypes.onChange = this.divSoundTypes.onChange.bind(this.divSoundTypes, this.inputSelectAll);
		this.fieldsetTiming.onChange = this.fieldsetTiming.onChange.bind(this.fieldsetTiming, this.inputDesiredLengthSeconds, this.inputMinDelaySeconds, this.inputMaxDelaySeconds);
		this.inputSelectAll.onChange = this.inputSelectAll.onChange.bind(this.inputSelectAll, this.divSoundTypes);
		this.selectPonies.onChange = this.selectPonies.onChange.bind(this.selectPonies, this.divSoundTypes, this.inputSelectAll, this.soundTypeOptions);
		return this;
	}
	init() {
		this.bindChildEvents().addEventListeners();
		const list = Response.checkResponseError(window.JSON.parse(elements.scriptList.textContent));

		if (!window.Array.isArray(list.response) || list.response.length === 0)
			throw "Received an invalid response";
		this.selectPonies.init(list.response, this.soundTypeOptions).onChange();
		this.selectOutputFormat.init(list.requestProperties.validOutputFormats);
		setAttributes(this.inputDesiredLengthSeconds.element, {
			max: list.requestProperties.maxDesiredLengthSeconds,
			maxlength: String(list.requestProperties.maxDesiredLengthSeconds).length,
			min: list.requestProperties.minDesiredLengthSeconds
		});
		this.inputMinDelaySeconds.element.setAttribute("min", list.requestProperties.minDelaySeconds);
		return this;
	}
	onSubmit() {
		const request = new Request({
			requestType: "audio", 
			desiredLengthSeconds: window.Number(this.inputDesiredLengthSeconds.value),
			maxDelaySeconds: window.Number(this.inputMaxDelaySeconds.value),
			minDelaySeconds: window.Number(this.inputMinDelaySeconds.value),
			outputFormat: this.selectOutputFormat.value,
			ponies: [this.selectPonies.value], 
			soundTypes: this.divSoundTypes.selected
		});
		const response = new Response(request.fetch());
		response.process(this.selectPonies.value, this.selectOutputFormat.value, this.outputAudio).catch(console.error);
	}
}

class FormElement {
	constructor() { this.element = elements[this.constructor.name.replace(/^([A-Z])/, (c) => c[0].toLowerCase())]; }
	get value() { return this.element.value; }
	set value(newValue) { this.element.value = newValue; }
	addEventListener(...args) { return this.element.addEventListener(...args); }
	removeAllChildren() {
		while (this.element.firstChild)
			this.element.removeChild(this.element.firstChild);
		return this;
	}
}

class TimingFormElement extends FormElement {
	checkValue() { this.value = window.Math.min(window.Math.max(Number(this.value), Number(this.min)), Number(this.max)); }
	get max() { return this.element.max; }
	get min() { return this.element.min; }
}

class ButtonGetAudio extends FormElement {}

class DivSoundTypes extends FormElement {
	get selected() {
		return Array.prototype.reduce.call(this.inputs, (selected, input) => {
			if (input.checked)
				selected.push(input.value);
			return selected;
		}, new window.Array());
	}
	set checked(newChecked) { this.inputs.forEach((input) => input.checked = newChecked); }
	onChange(inputSelectAll) {
		const selected = Array.prototype.filter.call(this.inputs, (input) => input.checked);
		let state;

		if (selected.length === this.inputs.length)
			state = { checked: true, indeterminate: false };
		else if (selected.length > 0)
			state = { checked: false, indeterminate: true };
		else
			state = { checked: false, indeterminate: false };
		window.Object.assign(inputSelectAll.element, state);
	}
	updateInputs() { this.inputs = this.element.querySelectorAll("input"); }
}

class FieldsetTiming extends FormElement {
	onChange(inputDesiredLengthSeconds, inputMinDelaySeconds, inputMaxDelaySeconds) {
		inputDesiredLengthSeconds.checkValue();
		setAttributes(inputMinDelaySeconds.element, { max: inputDesiredLengthSeconds.value, maxlength: String(inputDesiredLengthSeconds.value).length + 2 });
		inputMinDelaySeconds.checkValue();
		setAttributes(inputMaxDelaySeconds.element, { max: inputDesiredLengthSeconds.value, maxlength: String(inputDesiredLengthSeconds.value).length + 2, min: inputMinDelaySeconds.value });
		inputMaxDelaySeconds.checkValue();
	}
}

class InputDesiredLengthSeconds extends TimingFormElement {}
class InputMaxDelaySeconds extends TimingFormElement {}
class InputMinDelaySeconds extends TimingFormElement {}

class InputSelectAll extends FormElement {
	onChange(divSoundTypes) { divSoundTypes.checked = this.element.checked; }
}

class OutputAudio extends FormElement {
	constructor() {
		super();
		this.isLoading = false;
	}
	get loading() { return this.isLoading; }
	set loading(isLoading) {
		if (isLoading && !this.loading)
			this.value = window.document.createElement("progress");
		this.isLoading = isLoading;
	}
	set value(newNode) {
		if (!(newNode instanceof window.Node))
			newNode = window.document.createTextNode(String(newNode));
		this.removeAllChildren().element.appendChild(newNode);
	}
}

class SelectOutputFormat extends FormElement {
	init(validOutputFormats) {
		const options = window.document.createDocumentFragment();

		for (const outputFormat in validOutputFormats)
			createElement("option", {}, options, outputFormat);
		this.element.appendChild(options);
		return this;
	}
}

class SelectPonies extends FormElement {
	init(ponies, soundTypeOptions) {
		const options = window.document.createDocumentFragment();
		ponies.forEach((pony) => {
			createElement("option", {}, options, pony.name);
			soundTypeOptions.set(pony.name, { ponyName: pony.name, soundTypes: pony.soundTypes });
		});
		this.element.appendChild(options);
		return this;
	}
	onChange(divSoundTypes, inputSelectAll, soundTypeOptions) {
		divSoundTypes.removeAllChildren().element.appendChild(soundTypeOptions.get(this.value).content.cloneNode(true));
		inputSelectAll.element.checked = true;
		divSoundTypes.updateInputs();
	}
}