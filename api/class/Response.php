<?php
	class Response {
		private $responseType; // string
		private $response; // \JsonSerializable

		public static function outputError(string $message) {
			$response = new self("error", new \Ds\Map(["error" => $message]));
			$response->output();
		}

		public function __construct(string $responseType, \JsonSerializable $response) {
			list($this->responseType, $this->response) = [$responseType, $response];
		}

		public function output(array $requestProperties = null) {
			header("Content-Type: application/json");
			echo json_encode(["requestProperties" => $requestProperties, "responseType" => $this->responseType, "response" => $this->response]);
		}
	}
?>