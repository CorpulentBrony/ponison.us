"use strict";
import { Form } from "./Form.mjs";

(function index() {
	const isDocumentLoaded = new window.Promise((resolve) => {
		if (window.document.readyState === "loading")
			window.document.addEventListener("DOMContentLoaded", resolve, false);
		else
			resolve();
	});

	(async function onDocumentLoad() {
		await isDocumentLoaded;
		const form = new Form();
		form.init();
	})().catch(console.error);
})();