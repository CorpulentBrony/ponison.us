<?php
	require_once "FileSystemObject.php";

	class SoundTypeList extends FileSystemObject {
		protected $numberAvailable = null; // int

		public function getNumberAvailable(): int { return $this->numberAvailable ?? $this->numberAvailable = iterator_count(new \FileSystemIterator(parent::getPath())); }
		public function jsonSerialize() { return ["name" => parent::getName(), "numberAvailable" => $this->getNumberAvailable()]; }
	}
?>