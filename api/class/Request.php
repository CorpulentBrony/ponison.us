<?php
	class Request {
		const DEFAULT_DESIRED_LENGTH_SECONDS = 1;
		const DEFAULT_MIN_DELAY_SECONDS = 0;
		const DEFAULT_OUTPUT_FORMAT = "mp3";
		const DEFAULT_PONIES = ["Twilight Sparkle"];
		const DEFAULT_SOUND_TYPES = ["Breath"];
		const MAX_DESIRED_LENGTH_SECONDS = 120;
		const MIN_DELAY_SECONDS = 0;
		const MIN_DESIRED_LENGTH_SECONDS = 1;
		const PONY_DIR = __DIR__ . "/../../pony/";
		const UNKNOWN_REQUEST_TYPE_MESSAGE = "Unknown request type, do not know how to fulfill requests of type %s";
		const UNSUPPLIED_REQUEST_TYPE_MESSAGE = "Request type not supplied";
		const UNSUPPLIED_VALUE_MESSAGE = "You must select at least one %s";
		const VALID_OUTPUT_FORMATS = ["mp3" => "audio/mpeg"];
		const VALID_REQUEST_TYPES = ["audio", "list"];

		private $requestType; // string
		private $desiredLengthSeconds; // int
		private $minDelayDeciseconds; // int
		private $maxDelayDeciseconds; // int
		private $outputFormat; // int
		private $ponies; // [string]
		private $soundTypes; // [string]

		public function __construct(\stdClass $request) {
			if (!isset($request->requestType))
				throw new \UnexpectedValueException(sprintf(self::UNSUPPLIED_VALUE_MESSAGE, "request type"));

			if (isset($request->ponies) && is_array($request->ponies) && count($request->ponies) === 0)
				$request->ponies = null;

			if (isset($request->soundTypes) && is_array($request->soundTypes) && count($request->soundTypes) === 0)
				$request->soundTypes = null;
			$this->setRequestType(strval($request->requestType));
			$this->setDesiredLengthSeconds(intval($request->desiredLengthSeconds ?? self::DEFAULT_DESIRED_LENGTH_SECONDS));
			$this->setDelayDeciseconds(strval($request->minDelaySeconds ?? self::DEFAULT_MIN_DELAY_SECONDS), $request->maxDelaySeconds ?? null);
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
			require_once "AudioGenerator.php";
			$audioGenerator = new AudioGenerator([
				"desiredLengthSeconds" => $this->desiredLengthSeconds, 
				"minDelayDeciseconds" => $this->minDelayDeciseconds, 
				"maxDelayDeciseconds" => $this->maxDelayDeciseconds, 
				"outputFormat" => $this->outputFormat, 
				"ponies" => $this->ponies,
				"ponyListFileinfo" => $this->getPonyListFileinfo(),
				"soundTypes" => $this->soundTypes
			]);
			$response = new Response($this->requestType, $audioGenerator->generate());
			$response->output();
		}

		public function fulfillList() {
			require_once "PonyList.php";
			$response = new Response($this->requestType, new PonyList($this->getPonyListFileinfo()));
			$response->output([
				"defaultOutputFormat" => self::DEFAULT_OUTPUT_FORMAT, 
				"maxDesiredLengthSeconds" => self::MAX_DESIRED_LENGTH_SECONDS, 
				"minDelaySeconds" => self::MIN_DELAY_SECONDS, 
				"minDesiredLengthSeconds" => self::MIN_DESIRED_LENGTH_SECONDS, 
				"validOutputFormats" => self::VALID_OUTPUT_FORMATS
			]);
		}

		private function getPonyListFileinfo(): \SplFileInfo { return new \SplFileInfo(realpath(self::PONY_DIR)); }

		private function setDelayDeciseconds(string $minDelaySeconds, $maxDelaySeconds) {
			require_once __DIR__ . "/../include/bcmath.php";
			bcscale(1);
			$minDelaySeconds = bcmax($minDelaySeconds, strval(self::MIN_DELAY_SECONDS));
			$this->minDelayDeciseconds = intval(bcmul($minDelaySeconds, "10"));
			$this->maxDelayDeciseconds = intval(bcmul(bcmin(bcmax(strval($maxDelaySeconds ?? $minDelaySeconds), $minDelaySeconds), strval($this->desiredLengthSeconds)), "10"));
		}

		private function setDesiredLengthSeconds(int $desiredLengthSeconds) { $this->desiredLengthSeconds = min(max($desiredLengthSeconds, self::MIN_DESIRED_LENGTH_SECONDS), self::MAX_DESIRED_LENGTH_SECONDS); }

		private function setOutputFormat(string $outputFormat) {
			if (!array_key_exists($outputFormat, self::VALID_OUTPUT_FORMATS))
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