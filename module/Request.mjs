const URL = window.URL || window.webkitURL;

export class Request extends window.Request {
	constructor(body) { super(Request.API_URL, { body, headers: { ["Content-Type"]: "application/json" }, method: "POST" }); }
}
Request.API_URL = new URL("https://api.ponison.us/index.php");