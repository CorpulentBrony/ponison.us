"use strict";
import { Form } from "./Form.mjs";
import { isDocumentLoaded, loadDeferredStylesheets } from "./util.mjs";

(async function onDocumentLoad() {
	loadDeferredStylesheets().catch(console.error);
	await isDocumentLoaded;
	const form = new Form();
	form.init();
})().catch(console.error);