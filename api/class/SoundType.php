<?php
	require_once "FileSystemObject.php";

	class SoundType extends FileSystemObject {
		protected $numberAvailable = null; // int

		public function getNumberAvailable(): int {
			if (is_null($this->numberAvailable))
				$this->numberAvailable = iterator_count(new \FileSystemIterator(parent::getPath()));
			return $this->numberAvailable;
		}

		public function jsonSerialize() { return ["name" => parent::getName(), "numberAvailable" => $this->getNumberAvailable()]; }
	}
?>