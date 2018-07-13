<?php
	ini_set("zlib.output_compression", 0);
	header("Content-Type: text/plain");
	header("Access-Control-Allow-Headers: Content-Type");
	header("Access-Control-Allow-Origin: https://ponison.us");
	header("Vary: Origin");

	// error_reporting(E_ALL); // comment out in prod
	// ini_set("display_errors", 1); // comment out in prod

	header("Content-Type: application/json");

	class Request {
		const DEFAULT_DESIRED_LENGTH_SECONDS = 1;
		const DEFAULT_MIN_DELAY_SECONDS = 0;
		const DEFAULT_OUTPUT_FORMAT = "mp3";
		const DEFAULT_PONIES = [];
		const DEFAULT_SOUND_TYPES = [];
		const MAX_DESIRED_LENGTH_SECONDS = 60 * 60;
		const MIN_DELAY_SECONDS = 0;
		const MIN_DESIRED_LENGTH_SECONDS = 1;
		const VALID_OUTPUT_FORMATS = ["mp3"];
		const VALID_REQUEST_TYPES = ["audio", "list"];

		private $requestType; // string
		private $desiredLengthSeconds; // int
		private $minDelaySeconds; // int
		private $maxDelaySeconds; // int
		private $outputFormat; // int
		private $ponies; // [string]
		private $soundTypes; // [string]

		public function __construct(\stdClass $request) {
			if (!isset($request->requestType))
				throw new \Exception("Request type not supplied.");
			$this->setRequestType(strval($request->requestType));
			$this->setDesiredLengthSeconds(intval($request->desiredLengthSeconds ?? self::DEFAULT_DESIRED_LENGTH_SECONDS));
			$this->setDelaySeconds(intval($request->minDelaySeconds ?? self::DEFAULT_MIN_DELAY_SECONDS), $request->maxDelaySeconds ?? null);
			$this->setOutputFormat(strval($request->outputFormat ?? self::DEFAULT_OUTPUT_FORMAT));
			$this->ponies = $this->toStringArray($request->ponies ?? self::DEFAULT_PONIES);
			$this->soundTypes = $this->toStringArray($request->soundTypes ?? self::DEFAULT_SOUND_TYPES);
		}

		private function setDelaySeconds(int $minDelaySeconds, $maxDelaySeconds) {
			$this->minDelaySeconds = max($minDelaySeconds, self::MIN_DELAY_SECONDS);
			$this->maxDelaySeconds = min(max(intval($maxDelaySeconds ?? $this->minDelaySeconds), $this->minDelaySeconds), $this->desiredLengthSeconds);
		}

		private function setDesiredLengthSeconds(int $desiredLengthSeconds) { $this->desiredLengthSeconds = min(max($desiredLengthSeconds, self::MIN_DESIRED_LENGTH_SECONDS), self::MAX_DESIRED_LENGTH_SECONDS); }

		private function setOutputFormat(string $outputFormat) {
			if (!in_array($outputFormat, self::VALID_OUTPUT_FORMATS, true))
				$outputFormat = self::DEFAULT_OUTPUT_FORMAT;
			$this->outputFormat = $outputFormat;
		}

		private function setRequestType(string $requestType) {
			if (!in_array($requestType, self::VALID_REQUEST_TYPES, true))
				throw new \Exception("Unknown request type: {$requestType}");
			$this->requestType = $requestType;
		}

		private function toStringArray($value): array {
			if (!is_array($value))
				return [strval($value)];
			return array_map(function($value): string { return strval($value); }, array_values($value));
		}
	}

	try {
		$requestText = file_get_contents("php://input");
		$requestDecoded = json_decode($requestText);

		if (is_null($requestDecoded))
			throw new \Exception("Request was either malformed or empty.  Request received: {$requestText}");
		$request = new Request($requestDecoded);
	} catch (\Exception $e) {
		echo json_encode(["error" => "Exception while processing request: {$e->getMessage()}"]);
	}


	return;

	require_once "class/PonyList.php";

	const PONY_DIR = __DIR__ . "/../pony/";

	$ponyList = new PonyList(new \SplFileInfo(PONY_DIR));
	var_dump(json_encode($ponyList));

	// [
	//     {
	//         "name": string,
	//         "soundTypes": [
	//             {
	//                 "name": string,
	//                 "numberAvailable": number
	//             }
	//         ]
	//     }
	// ]
?>