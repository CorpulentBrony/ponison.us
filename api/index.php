<?php
	ini_set("zlib.output_compression", 0);
	header("Content-Type: text/plain");
	header("Access-Control-Allow-Headers: Content-Type");
	header("Access-Control-Allow-Origin: https://ponison.us");
	header("Vary: Origin");

	error_reporting(E_ALL); // comment out in prod
	ini_set("display_errors", 1); // comment out in prod

	try {
		$requestText = $requestText ?? file_get_contents("php://input");
		$requestDecoded = json_decode($requestText);

		if (is_null($requestDecoded))
			throw new \RuntimeException("Request was either malformed or empty.");
		require_once "class/Request.php";
		$request = new Request($requestDecoded);
		$request->fulfill();
	} catch (\Exception $e) {
		require_once "class/Response.php";
		Response::outputError("Exception while processing request: {$e->getMessage()}");
	}
?>