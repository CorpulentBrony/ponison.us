import { elements } from "./Elements.mjs";
import { removeAllChildren, setAttributes } from "./util.mjs";
const URL = window.URL || window.webkitURL;

export class Response {
	static checkResponseError(response) {
		if (!response)
			throw "Could not parse response or an empty response received";
		else if (response.responseType === "error")
			throw response.response;
		return response;
	}
	constructor(responsePromise, form) {
		[this.numRequests, this.responsePromise, this.form] = [0, responsePromise, form];
		this.process().catch(console.error);
	}
	async process() {
		const responseObject = await this.responsePromise;
		const response = this.constructor.checkResponseError(await responseObject.json()).response;
		const audio = await window.fetch(response.outputFile.url).then((response) => response.blob()).catch(console.error);
		const audioUrl = URL.createObjectURL(audio);
		const download = `PoniSonus ${this.form.selectPonies.value}${(this.numRequests++ === 0) ? "" : ` ${this.numRequests.toString()}`}.${this.form.selectOutputFormat.value}`;
		const outputAudio = elements.templateOutputAudio.content.cloneNode(true);
		const audioElement = outputAudio.querySelector("audio");
		try { audioElement.srcObject = audio; }
		catch (err) { audioElement.src = audioUrl; }
		outputAudio.querySelector("track").setAttribute("src", URL.createObjectURL(new window.Blob([response.timingLog], { type: "text/vtt" })));
		setAttributes(outputAudio.getElementById("a-download"), { download, href: audioUrl }).removeAttribute("id");
		setAttributes(outputAudio.getElementById("time-duration"), { datetime: `PT${response.outputFile.durationSeconds}S`, textContent: `${response.outputFile.durationSeconds} seconds` }).removeAttribute("id");
		setAttributes(outputAudio.getElementById("data-size"), { textContent: `${response.outputFile.sizeBytes} bytes`, value: response.outputFile.sizeBytes }).removeAttribute("id");
		// setAttributes(outputAudio.getElementById("time-lifetime"), { datetime: `PT${response.outputFile.lifetimeSeconds}S`, textContent: `${response.outputFile.lifetimeSeconds} seconds` }).removeAttribute("id");
		setAttributes(outputAudio.getElementById("time-processing"), { datetime: `PT${response.generationTimeElapsedSeconds}S`, textContent: `${response.generationTimeElapsedSeconds} seconds`}).removeAttribute("id");
		setAttributes(outputAudio.getElementById("data-used-sound-types"), { textContent: `${response.numberSoundTypesUsed} sound types`, value: response.numberSoundTypesUsed }).removeAttribute("id");
		setAttributes(outputAudio.getElementById("data-total-sound-types"), { textContent: String(response.totalSoundTypesSelected), value: response.totalSoundTypesSelected }).removeAttribute("id");
		const soundTypePercentageUsed = response.numberSoundTypesUsed / response.totalSoundTypesSelected;
		setAttributes(outputAudio.getElementById("data-percent-of-total"), { textContent: `${Number(soundTypePercentageUsed * 100).toFixed(2)}%`, value: soundTypePercentageUsed }).removeAttribute("id");
		outputAudio.querySelector("code").textContent = JSON.stringify(response);
		removeAllChildren(elements.outputAudio).appendChild(outputAudio);
		// window.setTimeout(() => removeAllChildren(elements.outputAudio), response.outputFile.lifetimeSeconds * 1000);
	}
}