const URL = window.URL || window.webkitURL;

export class Request extends window.Request {
	constructor(body) {
		super(Request.API_URL, { body: window.JSON.stringify(body), headers: { ["Content-Type"]: "application/json" }, method: "POST" });
		// Request overwrites methods added in the usual way for some reason, so adding method here instead
		this.fetch = () => window.fetch(this);
	}
}
Request.API_URL = new URL("https://api.ponison.us/index.php");