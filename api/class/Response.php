<?php
	class Response {
		private $response; // \JsonSerializable

		public static function outputError(string $message) {
			$response = new self(new \Ds\Map(["error" => $message]));
			$response->output();
		}

		public function __construct(\JsonSerializable $response) {
			$this->response = $response;
		}

		public function output() {
			header("Content-Type: application/json");
			echo json_encode($this->response);
		}
	}
?>