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
	const form = new Form();
	form.init();
})().catch(console.error);