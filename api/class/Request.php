<?php
	// https://trac.ffmpeg.org/wiki/Concatenate - using the demux; generate temp file with list of fiels and then process the command
	// this is another alternative but command line could get too long ffmpeg -i "concat:breath_s1e01_001.mp3|breath_s1e01_002.mp3" -c copy test1.mp3
	class Request {
		const DEFAULT_DESIRED_LENGTH_SECONDS = 1;
		const DEFAULT_MIN_DELAY_SECONDS = 0;
		const DEFAULT_OUTPUT_FORMAT = "mp3";
		const DEFAULT_PONIES = [];
		const DEFAULT_SOUND_TYPES = [];
		const MAX_DESIRED_LENGTH_SECONDS = 60 * 60;
		const MIN_DELAY_SECONDS = 0;
		const MIN_DESIRED_LENGTH_SECONDS = 1;
		const PONY_DIR = __DIR__ . "/../../pony/";
		const UNKNOWN_REQUEST_TYPE_MESSAGE = "Unknown request type, do not know how to fulfill requests of type %s";
		const UNSUPPLIED_REQUEST_TYPE_MESSAGE = "Request type not supplied";
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
				throw new \UnexpectedValueException(self::UNSUPPLIED_REQUEST_TYPE_MESSAGE);
			$this->setRequestType(strval($request->requestType));
			$this->setDesiredLengthSeconds(intval($request->desiredLengthSeconds ?? self::DEFAULT_DESIRED_LENGTH_SECONDS));
			$this->setDelaySeconds(intval($request->minDelaySeconds ?? self::DEFAULT_MIN_DELAY_SECONDS), $request->maxDelaySeconds ?? null);
			$this->setOutputFormat(strval($request->outputFormat ?? self::DEFAULT_OUTPUT_FORMAT));
			$this->ponies = $this->toStringArray($request->ponies ?? self::DEFAULT_PONIES);
			$this->soundTypes = $this->toStringArray($request->soundTypes ?? self::DEFAULT_SOUND_TYPES);
		}

		public function fulfill() {
			require_once "Response.php";

			switch ($this->requestType) {
				case "audio":
					$this->fulfillAudio();
					break;
				case "list":
					$this->fulfillList();
					break;
				default:
					throw new \UnexpectedValueException(sprintf(self::UNKNOWN_REQUEST_TYPE_MESSAGE, $this->requestType));
			}
		}

		public function fulfillAudio() {
			throw new \Exception("Audio fulfillment is not yet ready " . json_encode([$this->requestType, $this->ponies, $this->soundTypes]));
		}

		public function fulfillList() {
			require_once "PonyList.php";

			$response = new Response(new PonyList(new \SplFileInfo(realpath(self::PONY_DIR))));
			$response->output();
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
				throw new \UnexpectedValueException(sprintf(self::UNKNOWN_REQUEST_TYPE_MESSAGE, $this->requestType));
			$this->requestType = $requestType;
		}

		private function toStringArray($value): array {
			if (!is_array($value))
				return [strval($value)];
			return array_map(function($value): string { return strval($value); }, array_values($value));
		}
	}
?>