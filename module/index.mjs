"use strict";
import { elements } from "./Elements.mjs";
import { Form } from "./Form.mjs";
import { isDocumentLoaded, loadDeferredStylesheets } from "./util.mjs";

(async function onDocumentLoad() {
	async function loadDeferredStylesheetsAndBg() {
		await loadDeferredStylesheets();
		window.document.body.appendChild(elements.templateBackgroundImage.content);
	}

	loadDeferredStylesheetsAndBg().catch(console.error);
	await isDocumentLoaded;
	elements.ponisonusDivBgClickCatch.addEventListener("click", () => elements.ponisonusImgBg.style.transform = (elements.ponisonusImgBg.style.transform === "") ? "rotate(110deg)" : "", true);
	const form = new Form();
	form.init();
})().catch(console.error);